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
  NostrReadOnlyError,
} from '@/infrastructure/nostr/nostrErrors'
import {
  LnurlPay,
  toBech32EncodedLnurl,
  toLnurlPayUrl,
} from '@/infrastructure/nostr/lnurlPay'
import { generateEventId, unixtime } from '@/infrastructure/nostr/utils'
import { decode } from 'light-bolt11-decoder'
import { RobustEventFetcher } from './robustEventFetcher'
import { Mutex } from 'async-mutex'
import { CommonRelays } from './commonRelays'
import { ErrorWithDetails } from '../errors/ErrorWithDetails'
import { KeyPair } from '@/domain/entities/KeyPair'
import { finalizeEvent, nip44 } from 'nostr-tools'
import { NDKKind_Seal, NDKKind_GiftWrap } from './kindExtensions'
import { eventBus } from '@/utils/eventBus'
import { randomBytes } from 'crypto'

const NIP07TimeoutMSec = 3000 // 3 seconds
const NDKConnectTimeoutMSec = 1000 // 1 second
const PostEventTimeoutMSec = 10000 // 10 seconds

type ZapResponse = {
  pr: string
  verify: string
  successAction?: {
    tag: string
    message?: string
  }
}

type WindowNostr = {
  getPublicKey: () => Promise<string>
  signEvent: (event: NostrEvent) => Promise<NostrEvent>
  nip04: {
    encrypt: (pubkey: string, plaintext: string) => Promise<string>
    decrypt: (pubkey: string, ciphertext: string) => Promise<string>
  }
  nip44: {
    encrypt: (pubkey: string, plaintext: string) => Promise<string>
    decrypt: (pubkey: string, ciphertext: string) => Promise<string>
  }
}

export class NostrClient {
  readonly #ndk: NDK
  readonly #user: NDKUser
  readonly #isLoggedIn: boolean
  readonly #nostrLoginWindowNostr: WindowNostr

  private constructor(
    ndk: NDK,
    user: NDKUser,
    nostrLoginWindowNostr: WindowNostr,
    isLoggedIn: boolean
  ) {
    this.#ndk = ndk
    this.#user = user
    this.#nostrLoginWindowNostr = nostrLoginWindowNostr
    this.#isLoggedIn = isLoggedIn
  }

  static readonly Relays = [
    'wss://relay.hakua.xyz',
    //'wss://relay.damus.io',
    //'wss://relay.nostr.band',
    //'wss://r.kojira.io',
    //...CommonRelays.Iris,
    //...CommonRelays.JapaneseRelays,
  ].filter((relay, index, self) => self.indexOf(relay) === index)

  static readonly JapaneseUserBot =
    '087c51f1926f8d3cb4ff45f53a8ee2a8511cfe113527ab0e87f9c5821201a61e'

  static readonly DefaultWindowNostr: WindowNostr = {
    getPublicKey: async () => NostrClient.JapaneseUserBot,
    signEvent: async (event: NostrEvent) => {
      throw new NostrReadOnlyError()
    },
    nip04: {
      encrypt: async (pubkey: string, plaintext: string) => {
        throw new NostrReadOnlyError()
      },
      decrypt: async (pubkey: string, ciphertext: string) => {
        throw new NostrReadOnlyError()
      },
    },
    nip44: {
      encrypt: async (pubkey: string, plaintext: string) => {
        throw new NostrReadOnlyError()
      },
      decrypt: async (pubkey: string, ciphertext: string) => {
        throw new NostrReadOnlyError()
      },
    },
    _requests: {},
    _pubkey: NostrClient.JapaneseUserBot,
  } as any

  static #nostrClient?: NostrClient
  static #mutex = new Mutex()

  static connect(): ResultAsync<NostrClient, Error> {
    return ResultAsync.fromPromise(
      NostrClient.#mutex.runExclusive(async () => {
        if (NostrClient.#nostrClient) {
          return NostrClient.#nostrClient
        }

        let isLoggedIn = true
        if (!window.nostr) {
          ;(window.nostr as any) = NostrClient.DefaultWindowNostr
          isLoggedIn = false
        }

        const signer = new NDKNip07Signer(NIP07TimeoutMSec)
        await signer.blockUntilReady()

        const ndk = new NDK({
          explicitRelayUrls: NostrClient.Relays,
          autoConnectUserRelays: true,
          signer,
        })
        ndk.assertSigner()

        await ndk.connect(NDKConnectTimeoutMSec)
        eventBus.emit('login')

        const user = await ndk!.signer!.user()
        const profile = await user.fetchProfile()
        if (!profile) {
          throw new Error('Failed to fetch profile')
        }

        NostrClient.#nostrClient = new NostrClient(
          ndk,
          user,
          window.nostr as any,
          isLoggedIn
        )
        return NostrClient.#nostrClient
      }),
      (error: unknown) => new Error(`Failed to connect: ${error}`)
    )
  }

  disconnect() {
    return ResultAsync.fromPromise(
      NostrClient.#mutex.runExclusive(async () => {
        NostrClient.#nostrClient = undefined
      }),
      (error) => new Error(`Failed to disconnect: ${error}`)
    )
  }

  isLoggedIn(): boolean {
    return this.#isLoggedIn
  }

  private async checkRelayConnection(): Promise<string[]> {
    const connectedRelays: string[] = []
    for (const relay of this.#ndk.pool.relays.values()) {
      if (relay.connectivity.isAvailable()) {
        connectedRelays.push(relay.url)
      } else {
        console.warn(`Relay ${relay.url} is not connected`)
      }
    }
    return connectedRelays
  }

  #postEvent(
    event: NostrEvent,
    alreadySigned: boolean
  ): ResultAsync<void, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        if (!this.#isLoggedIn) {
          throw new NostrReadOnlyError()
        }

        const connectedRelays = await this.checkRelayConnection()
        if (connectedRelays.length === 0) {
          throw new Error('No relays are connected')
        }

        const ndkEvent = new NDKEvent(this.#ndk, event)

        try {
          if (!alreadySigned) {
            await ndkEvent.sign()
          }
          const relaySet = NDKRelaySet.fromRelayUrls(connectedRelays, this.#ndk)
          console.log('postEvent: publish event', {
            ndkEvent,
            relaySet,
            event: ndkEvent.rawEvent(),
          })
          await ndkEvent.publish(relaySet, PostEventTimeoutMSec)
        } catch (error) {
          throw new Error(`Failed to post event: ${error}`)
        }
      })(),
      (error) =>
        error instanceof Error
          ? error
          : new Error(`Unknown error occurred while posting event: ${error}`)
    )
  }

  postEvent(event: NostrEvent): ResultAsync<void, Error> {
    return this.#postEvent(event, false)
  }

  postSignedEvent(event: NostrEvent): ResultAsync<void, Error> {
    return this.#postEvent(event, true)
  }

  private encryptPayload(
    unsignedKind14: NostrEvent,
    receiverPubkey: string
  ): ResultAsync<string, Error> {
    return ResultAsync.fromPromise(
      this.#nostrLoginWindowNostr.nip44.encrypt(
        receiverPubkey,
        JSON.stringify(unsignedKind14)
      ),
      (e: unknown) =>
        new ErrorWithDetails('Failed to encrypt content', e as Error)
    )
  }

  private decryptPayload(
    encryptedContent: string,
    senderPubkey: string
  ): ResultAsync<NostrEvent, Error> {
    return ResultAsync.fromThrowable(
      async () => {
        const json = await this.#nostrLoginWindowNostr.nip44.decrypt(
          senderPubkey,
          encryptedContent
        )
        return JSON.parse(json) as NostrEvent
      },
      (e) => new ErrorWithDetails('Failed to decryptPayload', e as Error)
    )()
  }

  private createSealNostrEvent(
    unsignedKind14: NostrEvent,
    receiverPubkey: string
  ): ResultAsync<NostrEvent, Error> {
    return this.encryptPayload(unsignedKind14, receiverPubkey).andThen(
      (encryptedContent) => {
        const unsignedSeal: NostrEvent = {
          pubkey: this.#user.pubkey,
          created_at: this.randomTimeUpTo2DaysInThePast(),
          kind: NDKKind_Seal,
          tags: [],
          content: encryptedContent,
        }
        const event = new NDKEvent(this.#ndk, {
          ...unsignedSeal,
          id: generateEventId(unsignedSeal),
        })

        return ResultAsync.fromPromise(
          event.sign(),
          (e) => new ErrorWithDetails('Failed to sign event', e as Error)
        ).map((sig) => ({
          ...event.rawEvent(),
          sig,
        }))
      }
    )
  }

  private randomTimeUpTo2DaysInThePast(): number {
    return Math.floor(Date.now() / 1000 - Math.random() * 172800)
  }

  createGiftWrapNostrEvent(
    unsignedKind14: NostrEvent,
    receiverPubkey: string
  ): ResultAsync<NostrEvent, Error> {
    const randomKeyPair = KeyPair.generate()
    return this.createSealNostrEvent(unsignedKind14, receiverPubkey)
      .andThen((sealNostrEvent) =>
        this.encryptSealNostrEvent(
          sealNostrEvent,
          randomKeyPair,
          receiverPubkey
        )
      )
      .andThen((giftWrappedContent) =>
        this.createGiftWrapUnsignedNostrEvent(
          giftWrappedContent,
          randomKeyPair,
          receiverPubkey
        )
      )
      .andThen((unsignedEvent) =>
        this.signNostrEvent(unsignedEvent, randomKeyPair)
      )
  }

  private encryptSealNostrEvent(
    sealNostrEvent: NostrEvent,
    randomKeyPair: KeyPair,
    receiverPubkeyHex: string
  ): Result<string, Error> {
    return Result.fromThrowable(
      () => {
        const conversationKey = nip44.getConversationKey(
          randomKeyPair.privateKey,
          receiverPubkeyHex
        )
        const nonce = new Uint8Array(randomBytes(32))
        return nip44.encrypt(
          JSON.stringify(sealNostrEvent),
          conversationKey,
          nonce
        )
      },
      (e) => new ErrorWithDetails('Failed to encryptSealNostrEvent', e as Error)
    )()
  }

  private decryptSealNostrEvent(
    giftWrappedContent: string,
    randomPubkeyHex: string
  ): ResultAsync<NostrEvent, Error> {
    return ResultAsync.fromThrowable(
      async () => {
        const json = await this.#nostrLoginWindowNostr.nip44.decrypt(
          randomPubkeyHex,
          giftWrappedContent
        )
        return JSON.parse(json) as NostrEvent
      },
      (e) => new ErrorWithDetails('Failed to decryptSealNostrEvent', e as Error)
    )()
  }

  private createGiftWrapUnsignedNostrEvent(
    giftWrappedContent: string,
    randomKeyPair: KeyPair,
    receiverPubkey: string
  ): ResultAsync<NostrEvent, Error> {
    const event: NostrEvent = {
      kind: NDKKind_GiftWrap,
      pubkey: randomKeyPair.publicKeyHex,
      created_at: this.randomTimeUpTo2DaysInThePast(),
      tags: [['p', receiverPubkey, 'wss://relay.hakua.xyz']], // TODO: リレーURLを修正
      content: giftWrappedContent,
      id: '',
      sig: '',
    }
    event.id = generateEventId(event)
    return ResultAsync.fromPromise(
      Promise.resolve(event),
      (e) =>
        new ErrorWithDetails('Failed to create gift wrap event', e as Error)
    )
  }

  private signNostrEvent(
    event: NostrEvent,
    randomKeyPair: KeyPair
  ): ResultAsync<NostrEvent, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const kind = event.kind as number
        const signedEvent = finalizeEvent(
          { ...event, kind },
          randomKeyPair.privateKey
        )
        return signedEvent
      })(),
      (error) => new ErrorWithDetails('Event signing failed', error as Error)
    )
  }

  decryptGiftWrapNostrEvent(event: NostrEvent): ResultAsync<NostrEvent, Error> {
    const giftWrappedContent = event.content
    return this.decryptSealNostrEvent(giftWrappedContent, event.pubkey).andThen(
      (sealEvent) => {
        if (sealEvent.kind !== NDKKind_Seal) {
          return ResultAsync.fromSafePromise(
            Promise.reject(new Error('Decrypted content is not a Seal'))
          )
        }
        return this.decryptPayload(sealEvent.content, sealEvent.pubkey)
      }
    )
  }

  subscribeEvents(
    filters: NDKFilter,
    onEvent: (event: NDKEvent) => ResultAsync<void, never | Error>,
    isForever: boolean = true
  ): Result<{ unsubscribe: () => void }, Error> {
    return Result.fromThrowable(
      () => {
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
            onEvent(event).match(
              () => {},
              (error) => console.error('never passed here', error)
            )
          })

        return {
          unsubscribe: () => {
            subscription.stop()
          },
        }
      },
      (error) => new Error(`subscribeEvents: ${error}`)
    )()
  }

  fetchEvent(eventId: string): ResultAsync<NDKEvent, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const event = await this.#ndk.fetchEvent(eventId)
        if (event === null) {
          throw new Error(`Event not found. eventId: ${eventId}`)
        }
        return event
      })(),
      (error) => new Error(`fetchEvent: ${error}`)
    )
  }

  robustFetchEvent(eventId: string): ResultAsync<NDKEvent, Error> {
    // Experimental: リクエストが増えすぎないように注意する
    const eventFetcher = new RobustEventFetcher(this.#ndk)
    return eventFetcher.robustFetchEvent(eventId)
  }

  fetchEvents(
    filter: NDKFilter,
    limit: number = 20
  ): ResultAsync<NDKEvent[], Error> {
    const batchFetchEvents = (batchSize: number): Promise<NDKEvent[]> =>
      new Promise((resolve) => {
        const batchEvents: NDKEvent[] = []
        const subscription = this.#ndk.subscribe(
          { ...filter, limit: batchSize },
          { closeOnEose: true }
        )

        subscription.on('event', (event: NDKEvent) => batchEvents.push(event))
        subscription.on('eose', () => {
          subscription.stop()
          resolve(batchEvents)
        })
      })

    const fetchAllEvents = async (): Promise<NDKEvent[]> => {
      const events: NDKEvent[] = []
      let remainingLimit = limit

      while (events.length < limit) {
        const batchSize = Math.min(remainingLimit, 100)
        const batchEvents = await batchFetchEvents(batchSize)

        events.push(...batchEvents)
        console.log('events', { events })

        if (batchEvents.length < batchSize) break
        remainingLimit -= batchEvents.length
      }

      const uniqueEvents = Array.from(
        new Map(events.map((event) => [event.id, event])).values()
      )

      return uniqueEvents.slice(0, limit)
    }

    return ResultAsync.fromPromise(
      fetchAllEvents(),
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

  getUserWithProfile(npub: string): ResultAsync<NDKUser, Error> {
    if (npub.length !== 63 || !npub.startsWith('npub')) {
      return ResultAsync.fromSafePromise(
        Promise.reject(new Error(`Invalid npub: ${npub}`))
      )
    }
    return ResultAsync.fromPromise(
      (async () => {
        const user = this.#ndk.getUser({ npub })
        await user.fetchProfile()
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

  sendZapRequest(
    nip05Id: string,
    sat: number
  ): ResultAsync<ZapResponse, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const millisats = sat * 1000
        const unsignedEventResult = await this.#makeZapRequest(
          nip05Id,
          millisats
        )
        if (unsignedEventResult.isErr()) {
          throw unsignedEventResult.error
        }
        const unsignedEvent = unsignedEventResult.value

        const sig = await this.#ndk.signer!.sign(unsignedEvent)

        const zapEndpointResult = await this.#getZapEndpointWithParams(
          unsignedEvent,
          sig,
          nip05Id
        )
        if (zapEndpointResult.isErr()) {
          throw zapEndpointResult.error
        }
        const zapEndpoint = zapEndpointResult.value

        const response = await axios.get(zapEndpoint)
        if (!response.data || response.data.status !== 'OK') {
          throw new NostrCallZapEndpointError(response)
        }

        const { pr, verify, successAction } = response.data
        if (!pr) {
          throw new NostrInvoiceNotFoundError(response)
        }

        return { pr, verify, successAction } as ZapResponse
      })(),
      (error): Error =>
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

export const getNostrClient = (): ResultAsync<NostrClient, Error> => {
  return NostrClient.connect()
}
