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
import { Mutex } from 'async-mutex'
import { CommonRelays } from './commonRelays'
import { KeyPair } from '@/domain/entities/KeyPair'
import { finalizeEvent, nip44, VerifiedEvent } from 'nostr-tools'
import { NDKKind_Seal, NDKKind_GiftWrap } from './kindExtensions'
import { randomBytes } from 'crypto'
import {
  catchError,
  from,
  map,
  Observable,
  of,
  reduce,
  switchMap,
  throwError,
  mergeMap,
  defer,
} from 'rxjs'
import { joinErrors } from '@/utils/errors'
import { safeJsonParse } from '@/utils/safeJsonParser'

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
  readonly #readOnlyMode: boolean
  readonly #nostrLoginWindowNostr: WindowNostr

  private constructor(
    ndk: NDK,
    user: NDKUser,
    nostrLoginWindowNostr: WindowNostr,
    readOnlyMode: boolean
  ) {
    this.#ndk = ndk
    this.#user = user
    this.#nostrLoginWindowNostr = nostrLoginWindowNostr
    this.#readOnlyMode = readOnlyMode
  }

  static readonly Relays = [
    'wss://relay.hakua.xyz',
    'wss://relay.damus.io',
    'wss://relay.nostr.band',
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

  static connect(): Observable<NostrClient> {
    return new Observable<NostrClient>((subscriber) => {
      NostrClient.#mutex.runExclusive(async () => {
        if (NostrClient.#nostrClient) {
          subscriber.next(NostrClient.#nostrClient)
          subscriber.complete()
          return
        }

        let readOnlyMode = false
        if (!window.nostr) {
          ;(window.nostr as any) = NostrClient.DefaultWindowNostr
          readOnlyMode = true
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

        const user = await ndk!.signer!.user()
        const profile = await user.fetchProfile()
        if (!profile) {
          // throw new Error('Failed to fetch profile')
        }

        NostrClient.#nostrClient = new NostrClient(
          ndk,
          user,
          window.nostr as any,
          readOnlyMode
        )
        subscriber.next(NostrClient.#nostrClient)
        subscriber.complete()
      })
    })
  }

  static disconnect() {
    return new Observable<void>((subscriber) => {
      NostrClient.#mutex.runExclusive(async () => {
        NostrClient.#nostrClient = undefined
        subscriber.next()
        subscriber.complete()
      })
    })
  }

  readOnlyMode(): boolean {
    return this.#readOnlyMode
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

  #postEvent(event: NostrEvent, alreadySigned: boolean): Observable<void> {
    return new Observable<void>((subscriber) => {
      ;(async () => {
        if (this.#readOnlyMode) {
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
          subscriber.complete()
        } catch (error) {
          subscriber.error(joinErrors(new Error('Failed to post event'), error))
        }
      })()
    })
  }

  postEvent(event: NostrEvent): Observable<void> {
    return this.#postEvent(event, false)
  }

  postSignedEvent(event: VerifiedEvent): Observable<void> {
    return this.#postEvent(event, true)
  }

  private encryptPayload(
    unsignedKind14: NostrEvent,
    receiverPubkey: string
  ): Observable<string> {
    return from(
      this.#nostrLoginWindowNostr.nip44.encrypt(
        receiverPubkey,
        JSON.stringify(unsignedKind14)
      )
    )
  }

  private decryptPayload(
    encryptedContent: string,
    senderPubkey: string
  ): Observable<NostrEvent> {
    return from(
      this.#nostrLoginWindowNostr.nip44.decrypt(senderPubkey, encryptedContent)
    ).pipe(map((json) => JSON.parse(json) as NostrEvent))
  }

  private createSealNostrEvent(
    unsignedKind14: NostrEvent,
    receiverPubkey: string
  ): Observable<NostrEvent> {
    return this.encryptPayload(unsignedKind14, receiverPubkey).pipe(
      map((encryptedContent) => {
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
        return event
      }),
      switchMap((event) =>
        from(event.sign()).pipe(map((sig) => ({ ...event.rawEvent(), sig })))
      )
    )
  }

  private randomTimeUpTo2DaysInThePast(): number {
    return Math.floor(Date.now() / 1000 - Math.random() * 172800)
  }

  createGiftWrapNostrEvent(
    unsignedKind14: NostrEvent,
    receiverPubkey: string
  ): Observable<VerifiedEvent> {
    const randomKeyPair = KeyPair.generate()
    return this.createSealNostrEvent(unsignedKind14, receiverPubkey).pipe(
      switchMap((sealNostrEvent) =>
        this.encryptSealNostrEvent(
          sealNostrEvent,
          randomKeyPair,
          receiverPubkey
        ).match(
          (content) => {
            const unsignedEvent = this.createGiftWrapUnsignedNostrEvent(
              content,
              randomKeyPair,
              receiverPubkey
            )
            return this.signNostrEvent(unsignedEvent, randomKeyPair).match(
              (verifiedEvent) => of(verifiedEvent),
              (error) => throwError(() => error)
            )
          },
          (error) => throwError(() => error)
        )
      )
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
      (e) => joinErrors(new Error('Failed to encryptSealNostrEvent'), e)
    )()
  }

  private decryptSealNostrEvent(
    giftWrappedContent: string,
    randomPubkeyHex: string
  ): Observable<NostrEvent> {
    return from(
      this.#nostrLoginWindowNostr.nip44.decrypt(
        randomPubkeyHex,
        giftWrappedContent
      )
    ).pipe(map((json) => JSON.parse(json) as NostrEvent))
  }

  private createGiftWrapUnsignedNostrEvent(
    giftWrappedContent: string,
    randomKeyPair: KeyPair,
    receiverPubkey: string
  ): NostrEvent {
    const event: NostrEvent = {
      kind: NDKKind_GiftWrap,
      pubkey: randomKeyPair.publicKeyHex,
      created_at: this.randomTimeUpTo2DaysInThePast(),
      tags: [['p', receiverPubkey]],
      content: giftWrappedContent,
      id: '',
      sig: '',
    }
    event.id = generateEventId(event)
    return event
  }

  private signNostrEvent(
    event: NostrEvent,
    randomKeyPair: KeyPair
  ): Result<VerifiedEvent, Error> {
    const kind = event.kind as number
    return Result.fromThrowable(
      () => finalizeEvent({ ...event, kind }, randomKeyPair.privateKey),
      (e) => joinErrors(new Error('Failed to signNostrEvent'), e)
    )()
  }

  decryptGiftWrapNostrEvent(event: NostrEvent): Observable<NostrEvent> {
    const giftWrappedContent = event.content
    return this.decryptSealNostrEvent(giftWrappedContent, event.pubkey).pipe(
      switchMap((sealEvent) => {
        if (sealEvent.kind !== NDKKind_Seal) {
          console.error("Kind of decrypted event is not 'Seal'", {
            kind: sealEvent.kind,
            pubkey: sealEvent.pubkey,
            created_at: sealEvent.created_at,
          })
          return of({
            kind: NDKKind_Seal,
            content: "Kind of decrypted event is not 'Seal'",
            tags: [],
            pubkey: sealEvent.pubkey,
            created_at: sealEvent.created_at,
          })
        }
        return this.decryptPayload(sealEvent.content, sealEvent.pubkey)
      })
    )
  }

  subscribeEvents(filters: NDKFilter): Observable<NDKEvent> {
    return new Observable<NDKEvent>((subscriber) => {
      try {
        const relaySet = NDKRelaySet.fromRelayUrls(
          NostrClient.Relays,
          this.#ndk
        )
        this.#ndk
          .subscribe(filters, { closeOnEose: false }, relaySet, true)
          .on('event', (event: NDKEvent) => {
            subscriber.next(event)
          })
          .on('eose', (sub) => {
            sub.stop()
            subscriber.complete()
          })
      } catch (error) {
        subscriber.error(
          joinErrors(new Error('Failed to subscribe events'), error)
        )
      }
    })
  }

  fetchEvent(eventId: string): Observable<NDKEvent> {
    return from(this.#ndk.fetchEvent(eventId)).pipe(
      map((event) => {
        if (event === null) {
          throw new Error(`Event not found. eventId: ${eventId}`)
        }
        return event
      })
    )
  }

  fetchEvents(filter: NDKFilter): Observable<NDKEvent> {
    return new Observable<NDKEvent>((subscriber) => {
      this.#ndk
        .subscribe(filter, { closeOnEose: true })
        .on('event', (event: NDKEvent) => {
          subscriber.next(event)
        })
        .on('eose', (sub) => {
          sub.stop()
          subscriber.complete()
        })
    })
  }

  getUser(npub: string): Result<NDKUser, Error> {
    if (npub.length !== 63 || !npub.startsWith('npub')) {
      return err(new Error(`Invalid npub: ${npub}`))
    }
    return ok(this.#ndk.getUser({ npub }))
  }

  getUserFromNip05(nip05Id: string): Observable<NDKUser | undefined> {
    return new Observable<NDKUser | undefined>((subscriber) => {
      this.#ndk
        .getUserFromNip05(nip05Id)
        .then((user) => {
          subscriber.next(user)
          subscriber.complete()
        })
        .catch((error) =>
          subscriber.error(
            joinErrors(new Error('Failed to get user from nip05'), error)
          )
        )
    })
  }

  getUserWithProfile(npub: string): Observable<NDKUser> {
    if (npub.length !== 63 || !npub.startsWith('npub')) {
      return new Observable<NDKUser>((subscriber) => {
        subscriber.error(new Error(`Invalid npub: ${npub}`))
      })
    }
    const user = this.#ndk.getUser({ npub })
    return from(user.fetchProfile()).pipe(
      switchMap((profile) => {
        if (!profile) {
          // NDKProfileが取得できずにNDKUserのみ取得できた場合
          console.warn(`Profile not found for user: ${npub}`)
          return of(user)
        }
        return of(user)
      })
    )
  }

  getLoggedInUser(): Result<NDKUser, Error> {
    return ok(this.#user)
  }

  fetchFollowingUsers(npub: string): Observable<NDKUser[]> {
    return new Observable<NDKUser[]>((subscriber) => {
      this.#ndk
        .getUser({ npub })
        .follows()
        .then((follows) => {
          subscriber.next(Array.from(follows))
          subscriber.complete()
        })
        .catch((error) =>
          subscriber.error(
            joinErrors(new Error('Failed to fetch following users'), error)
          )
        )
    })
  }

  decryptEvent(event: NDKEvent): Observable<NDKEvent> {
    return from(event.decrypt()).pipe(map(() => event))
  }

  calculateZapsAmount(eventId: string): Observable<number> {
    const zapFilter: NDKFilter = {
      kinds: [NDKKind.Zap],
      '#e': [eventId],
    }

    return this.fetchEvents(zapFilter).pipe(
      reduce((totalZapAmount, zapEvent) => {
        const zapAmount = this.extractZapAmount(zapEvent)
        if (zapAmount.isOk()) {
          return totalZapAmount + zapAmount.value
        }
        return totalZapAmount
      }, 0)
    )
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
      return err(
        joinErrors(new Error('Failed to decode bolt11 invoice'), error)
      )
    }

    return err(new Error('Failed to extract amount from bolt11 invoice'))
  }

  sendZapRequest(nip05Id: string, sat: number): Observable<ZapResponse> {
    return this.#makeZapRequest(nip05Id, sat * 1000).pipe(
      switchMap((unsignedEvent) => {
        return from(this.#ndk.signer!.sign(unsignedEvent)).pipe(
          switchMap((sig) => {
            return this.#getZapEndpointWithParams(unsignedEvent, sig, nip05Id)
          }),
          switchMap((zapEndpoint) => {
            return from(axios.get(zapEndpoint)).pipe(
              switchMap((response) => {
                if (!response.data || response.data.status !== 'OK') {
                  return throwError(
                    () => new NostrCallZapEndpointError(response)
                  )
                }
                const { pr, verify, successAction } = response.data
                if (!pr) {
                  return throwError(
                    () => new NostrInvoiceNotFoundError(response)
                  )
                }

                return of({ pr, verify, successAction } as ZapResponse)
              })
            )
          })
        )
      })
    )
  }

  // TODO: Change to Observable
  #requestLnurlPay(metadata: NostrEvent): Observable<LnurlPay> {
    const { lud16 } = JSON.parse(metadata.content)
    const lnurlPayUrl = toLnurlPayUrl(lud16)
    return from(axios.get(lnurlPayUrl)).pipe(
      switchMap((res) => {
        const body: LnurlPay = res.data
        if (!body.allowsNostr || !body.nostrPubkey) {
          return throwError(
            () => new Error(`${lud16} doesn't support Nostr. body: ${body}`)
          )
        }
        return of(body)
      })
    )
  }

  // TODO: Change to Observable
  #getZapEndpointWithParams(
    unsignedEvent: NostrEvent,
    sig: string,
    lud16: string
  ): Observable<string> {
    return this.#requestLnurlPay({
      ...unsignedEvent,
      id: unsignedEvent.tags[4][1],
      kind: 0,
      sig,
      content: JSON.stringify({ lud16 }),
    }).pipe(
      switchMap((lnurlPay) => {
        const callbackUrl = lnurlPay.callback
        if (!callbackUrl) {
          return throwError(
            () => new NostrGetZapEndpointCallbackUrlError(lnurlPay)
          )
        }
        const nostr = encodeURI(JSON.stringify(unsignedEvent))
        const amount = +unsignedEvent.tags[1][1]
        if (lnurlPay.minSendable && amount < lnurlPay.minSendable) {
          return throwError(
            () =>
              new NostrMinSendableConstraintError(amount, lnurlPay.minSendable)
          )
        }
        if (lnurlPay.maxSendable && amount > lnurlPay.maxSendable) {
          return throwError(
            () =>
              new NostrMaxSendableConstraintError(amount, lnurlPay.maxSendable)
          )
        }
        const lnurl = unsignedEvent.tags[2][1]
        const zapEndpoint = new URL(callbackUrl)
        zapEndpoint.searchParams.append('amount', amount.toString())
        zapEndpoint.searchParams.append('nostr', nostr)
        zapEndpoint.searchParams.append('lnurl', lnurl)
        return of(zapEndpoint.toString())
      })
    )
  }

  #makeZapRequest(nip05Id: string, msat: number): Observable<NostrEvent> {
    return from(NDKUser.fromNip05(nip05Id, this.#ndk)).pipe(
      switchMap((to) => {
        if (!to) {
          return throwError(() => new NostrUnknownUserError(nip05Id))
        }

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

        return of(unsignedEvent)
      }),
      catchError((error) =>
        throwError(() =>
          joinErrors(new Error('Failed to make zap request'), error)
        )
      )
    )
  }
}

export const connectNostrClient = (): Observable<NostrClient> => {
  return NostrClient.connect()
}

export const disconnectNostrClient = (): Observable<void> => {
  return NostrClient.disconnect()
}
