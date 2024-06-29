import { Result, ok, err, ResultAsync } from 'neverthrow'
import axios from 'axios'
import NDK, {
  NDKUser,
  NDKNip07Signer,
  NDKKind,
  NDKEvent,
  NDKRelaySet,
  NDKFilter,
  NostrEvent,
} from '@nostr-dev-kit/ndk'
import {
  NostrCallZapEndpointError,
  NostrGetZapEndpointCallbackUrlError,
  NostrInvoiceNotFoundError,
  NostrMaxSendableConstraintError,
  NostrMinSendableConstraintError,
  NostrUnknownUserError,
} from '@/infrastructure/nostr/nostrErrors'
import { CommonRelays } from '@/infrastructure/nostr/commonRelays'
import {
  LnurlPay,
  toBech32EncodedLnurl,
  toLnurlPayUrl,
} from '@/infrastructure/nostr/lnurlPay'
import { generateEventId, unixtime } from '@/infrastructure/nostr/utils'
import { decode } from 'light-bolt11-decoder'

const FetchTimeout = 5000 // 5 seconds
const MaxRetries = 3
const RetryDelay = 1000 // 1 second

export class NostrClient {
  #ndk: NDK
  #user: NDKUser

  private constructor(ndk: NDK, user: NDKUser) {
    this.#ndk = ndk
    this.#user = user
  }

  static readonly LoginTimeoutMSec = 60000
  static readonly Relays = [
    'wss://relay.hakua.xyz',
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
  ]
  static #nostrClient?: NostrClient

  static connect(): ResultAsync<NostrClient, Error> {
    if (NostrClient.#nostrClient) {
      return ResultAsync.fromSafePromise(
        Promise.resolve(NostrClient.#nostrClient)
      )
    }

    return ResultAsync.fromPromise(
      (async () => {
        const signer = new NDKNip07Signer(NostrClient.LoginTimeoutMSec)
        await signer.blockUntilReady()

        const ndk = new NDK({
          explicitRelayUrls: NostrClient.Relays,
          signer,
        })
        ndk.assertSigner()
        await ndk.connect(1)
        const user = await ndk!.signer!.user()
        await user.fetchProfile()
        NostrClient.#nostrClient = new NostrClient(ndk, user)
        return NostrClient.#nostrClient
      })(),
      (error) => new Error(`Failed to connect: ${error}`)
    )
  }

  subscribeEvents(
    filters: NDKFilter,
    onEvent: (event: NDKEvent) => void,
    isForever: boolean = true
  ): ResultAsync<{ unsubscribe: () => void }, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const relaySet = NDKRelaySet.fromRelayUrls(
          NostrClient.Relays,
          this.#ndk
        )
        const subscription = this.#ndk
          .subscribe(
            filters,
            {
              closeOnEose: !isForever,
            },
            relaySet,
            true
          )
          .on('event', (event: NDKEvent) => {
            onEvent(event)
          })

        return {
          unsubscribe: () => {
            subscription.stop()
          },
        }
      })(),
      (error) => new Error(`Failed to subscribe events: ${error}`)
    )
  }

  fetchEvent(eventId: string): ResultAsync<NDKEvent, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const event = await this.#ndk.fetchEvent(eventId)
        if (event === null) {
          throw new Error(`Event not found: ${eventId}`)
        }
        return event
      })(),
      (error) => new Error(`Failed to fetch event: ${error}`)
    )
  }

  fetchEvents(
    filter: NDKFilter,
    limit: number = 20
  ): ResultAsync<NDKEvent[], Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const events: NDKEvent[] = []
        let currentLimit = limit

        const fetchBatch = async (batchSize: number): Promise<NDKEvent[]> => {
          const batchFilter = { ...filter, limit: batchSize }
          return new Promise((resolve) => {
            const batchEvents: NDKEvent[] = []
            const subscription = this.#ndk.subscribe(
              batchFilter,
              { closeOnEose: true },
              undefined,
              true
            )

            subscription.on('event', (event: NDKEvent) => {
              batchEvents.push(event)
            })

            subscription.on('eose', () => {
              subscription.stop()
              resolve(batchEvents)
            })
          })
        }

        while (events.length < limit) {
          const batchSize = Math.min(currentLimit, 100)
          const batchEventsResult = await this.#fetchWithRetry(() =>
            fetchBatch(batchSize)
          )
          if (batchEventsResult.isErr()) {
            throw batchEventsResult.error
          }
          const batchEvents = batchEventsResult.value
          events.push(...batchEvents)

          if (batchEvents.length < batchSize) {
            break
          }

          currentLimit -= batchEvents.length
        }

        return events.slice(0, limit)
      })(),
      (error) => new Error(`Failed to fetch events: ${error}`)
    )
  }

  getUser(npub: string): Result<NDKUser, Error> {
    if (npub.length !== 63 || !npub.startsWith('npub')) {
      return err(new Error(`Invalid npub: ${npub}`))
    }
    return ok(this.#ndk.getUser({ npub }))
  }

  getUserFromNip05(nip05Id: string): ResultAsync<NDKUser | undefined, Error> {
    return ResultAsync.fromPromise(
      this.#ndk.getUserFromNip05(nip05Id),
      (error) => new Error(`Failed to get user from NIP-05: ${error}`)
    )
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  #fetchWithRetry(
    operation: () => Promise<any>,
    retries = 0
  ): ResultAsync<any, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const fetchWithTimeout = async () => {
          return Promise.race([
            operation(),
            new Promise((_, reject) =>
              setTimeout(
                () => reject(new Error('Operation timeout')),
                FetchTimeout
              )
            ),
          ])
        }

        try {
          return await fetchWithTimeout()
        } catch (error) {
          if (retries < MaxRetries - 1) {
            await this.delay(RetryDelay)
            return this.#fetchWithRetry(operation, retries + 1)
          } else {
            throw error
          }
        }
      })(),
      (error) => new Error(`Fetch operation failed: ${error}`)
    )
  }

  getUserWithProfile(npub: string): ResultAsync<NDKUser, Error> {
    if (npub.length !== 63 || !npub.startsWith('npub')) {
      return ResultAsync.fromSafePromise(
        Promise.reject(new Error(`Invalid npub: ${npub}`))
      )
    }
    return ResultAsync.fromPromise(
      (async () => {
        const user = this.#ndk.getUser({ npub })
        await this.#fetchWithRetry(() => user.fetchProfile())
        return user
      })(),
      (error) => new Error(`Failed to get user with profile: ${error}`)
    )
  }

  getLoggedInUser(): Result<NDKUser, Error> {
    return ok(this.#user)
  }

  decryptEvent(event: NDKEvent): ResultAsync<NDKEvent, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        await event.decrypt()
        return event
      })(),
      (error) => new Error(`Failed to decrypt event: ${error}`)
    )
  }

  calculateZapsAmount(eventId: string): ResultAsync<number, Error> {
    const zapFilter: NDKFilter = {
      kinds: [NDKKind.Zap],
      '#e': [eventId],
    }

    return this.fetchEvents(zapFilter).andThen((zapEvents) => {
      let totalZapAmount = 0
      for (const zapEvent of zapEvents) {
        const zapAmount = this.extractZapAmount(zapEvent)
        if (zapAmount.isOk()) {
          totalZapAmount += zapAmount.value
        }
      }
      return ok(totalZapAmount)
    })
  }

  private extractZapAmount(zapEvent: NDKEvent): Result<number, Error> {
    const bolt11Tag = zapEvent.tags.find((tag) => tag[0] === 'bolt11')
    if (!bolt11Tag || !bolt11Tag[1]) {
      return err(new Error('Missing bolt11 tag in zap receipt'))
    }

    try {
      const decodedInvoice = decode(bolt11Tag[1])
      const amountSection = decodedInvoice.sections.find(
        (section) => section.name === 'amount'
      )
      if (amountSection && amountSection.value) {
        // Convert millisatoshis to satoshis
        return ok(
          Math.floor(parseInt(amountSection.value as string, 10) / 1000)
        )
      }
    } catch (error) {
      return err(new Error(`Failed to decode bolt11 invoice: ${error}`))
    }

    return err(new Error('Failed to extract amount from bolt11 invoice'))
  }

  private validateZapReceipt(
    zapEvent: NDKEvent,
    lnurlProviderPubkey: string
  ): boolean {
    // Implement zap receipt validation as per Appendix F
    if (zapEvent.pubkey !== lnurlProviderPubkey) {
      return false
    }

    // Add more validation steps here...

    return true
  }
  sendZapRequest(nip05Id: string, sat: number) {
    return ResultAsync.fromPromise(
      (async () => {
        const millisats = sat * 1000
        const unsignedEventResult = await this.#makeZapRequest(
          nip05Id,
          millisats
        )
        if (unsignedEventResult.isErr()) {
          return err(unsignedEventResult.error)
        }
        const unsignedEvent = unsignedEventResult.value

        const sig = await this.#ndk.signer!.sign(unsignedEvent)

        const zapEndpointResult = await this.#getZapEndpointWithParams(
          unsignedEvent,
          sig,
          nip05Id
        )
        if (zapEndpointResult.isErr()) {
          return err(zapEndpointResult.error)
        }
        const zapEndpoint = zapEndpointResult.value

        const response = await axios.get(zapEndpoint)
        if (!response.data || response.data.status !== 'OK') {
          return err(new NostrCallZapEndpointError(response))
        }

        const { pr, verify, successAction } = response.data
        if (!pr) {
          return err(new NostrInvoiceNotFoundError(response))
        }

        return ok({ pr, verify, successAction })
      })(),
      (error) =>
        error instanceof Error
          ? error
          : new Error(`Failed to send zap request: ${error}`)
    )
  }

  #requestLnurlPay(metadata: NostrEvent): ResultAsync<LnurlPay, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const { lud16 } = JSON.parse(metadata.content)
        const lnurlPayUrl = toLnurlPayUrl(lud16)
        const res = await axios.get(lnurlPayUrl)
        const body: LnurlPay = await res.data
        if (!body.allowsNostr || !body.nostrPubkey) {
          throw new Error(`${lud16} doesn't support Nostr. body: ${body}`)
        }
        return body
      })(),
      (error) => new Error(`Failed to request LNURL Pay: ${error}`)
    )
  }

  #getZapEndpointWithParams(
    unsignedEvent: NostrEvent,
    sig: string,
    lud16: string
  ): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const metadata: NostrEvent = {
          ...unsignedEvent,
          id: unsignedEvent.tags[4][1],
          kind: 0,
          sig,
          content: JSON.stringify({ lud16 }),
        }
        const lnurlPayResult = await this.#requestLnurlPay(metadata)
        if (lnurlPayResult.isErr()) {
          throw lnurlPayResult.error
        }
        const lnurlPay = lnurlPayResult.value
        const callbackUrl = lnurlPay.callback
        if (!callbackUrl) {
          throw new NostrGetZapEndpointCallbackUrlError(metadata, lnurlPay)
        }
        const nostr = encodeURI(JSON.stringify(unsignedEvent))
        const amount = +unsignedEvent.tags[1][1]
        if (lnurlPay.minSendable && amount < lnurlPay.minSendable) {
          throw new NostrMinSendableConstraintError(
            amount,
            lnurlPay.minSendable
          )
        }
        if (lnurlPay.maxSendable && amount > lnurlPay.maxSendable) {
          throw new NostrMaxSendableConstraintError(
            amount,
            lnurlPay.maxSendable
          )
        }
        const lnurl = unsignedEvent.tags[2][1]
        const zapEndpoint = new URL(callbackUrl)
        zapEndpoint.searchParams.append('amount', amount.toString())
        zapEndpoint.searchParams.append('nostr', nostr)
        zapEndpoint.searchParams.append('lnurl', lnurl)
        return zapEndpoint.toString()
      })(),
      (error) =>
        error instanceof Error
          ? error
          : new Error(`Failed to get zap endpoint: ${error}`)
    )
  }

  #makeZapRequest(
    nip05Id: string,
    msat: number
  ): ResultAsync<NostrEvent, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const toResult = await NDKUser.fromNip05(nip05Id, this.#ndk)
        if (!toResult) {
          throw new NostrUnknownUserError(nip05Id)
        }
        const to = toResult

        const unsignedEvent: NostrEvent = {
          kind: NDKKind.ZapRequest,
          pubkey: this.#user.pubkey,
          created_at: unixtime(),
          tags: [
            ['relays', ...NostrClient.Relays],
            ['amount', msat.toString()],
            ['lnurl', toBech32EncodedLnurl(toLnurlPayUrl(nip05Id)!)],
            ['p', to.pubkey],
          ],
          content: 'zap request',
        }
        const eventId = generateEventId(unsignedEvent)
        unsignedEvent.tags.push(['e', eventId])
        return unsignedEvent
      })(),
      (error) =>
        error instanceof Error
          ? error
          : new Error(`Failed to make zap request: ${error}`)
    )
  }
}
