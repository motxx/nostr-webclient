import NDK, { NDKEvent } from '@nostr-dev-kit/ndk'
import { ResultAsync } from 'neverthrow'
import { CommonRelays } from './commonRelays'
import shuffle from 'fisher-yates'

const relayUrls = [
  ...new Set([
    ...CommonRelays.Iris,
    ...CommonRelays.MutinyWallet,
    ...CommonRelays.DamusRelays,
    ...CommonRelays.AmethystRelays,
    //...CommonRelays.JapaneseRelays,
  ]),
]

/**
 * Experimental
 * FIXME: このクラスに限ったことではないが、eventIdをキャッシュしていないため、何度も問い合わせが発生している
 *        取得成功したeventはeventIdでキャッシュ、失敗したeventはeventIdとrelayUrlの組み合わせてキャッシュし、全体で利用できるようにする
 * TODO: リクエスト数に対して、SUCCESSの数が多くなってきたらExperimentalを外す
 */
export class RobustEventFetcher {
  private ndk: NDK
  private relayUrls: string[]

  constructor(ndkInstance: NDK) {
    this.ndk = ndkInstance
    this.relayUrls = [...relayUrls]
  }

  private async tryFetchEvent(
    eventId: string,
    relayUrl: string
  ): Promise<NDKEvent | null> {
    const tempNdk = new NDK({ explicitRelayUrls: [relayUrl] })
    await tempNdk.connect()
    const event = await tempNdk.fetchEvent(eventId)
    return event
  }

  public robustFetchEvent(eventId: string): ResultAsync<NDKEvent, Error> {
    return ResultAsync.fromPromise(
      (async () => {
        let event = await this.ndk.fetchEvent(eventId)
        if (event !== null) {
          return event
        }

        console.log(`robust fetch ---- eventId: ${eventId}`)
        let times = 0
        const shuffledRelayUrls = shuffle(this.relayUrls)
        for (const relayUrl of shuffledRelayUrls) {
          try {
            times++
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log('fetchEvent', { times, relayUrl })
            event = await this.tryFetchEvent(eventId, relayUrl)
            if (event !== null) {
              console.log(`SUCCESS fetchEvent`, { times, relayUrl, event })
              return event
            }
          } catch (error) {
            console.error(`Error fetching event from relay ${relayUrl}:`, error)
          }
        }

        throw new Error(`Event not found. eventId: ${eventId}`)
      })(),
      (error) => new Error(`fetchEvent: ${error}`)
    )
  }
}
