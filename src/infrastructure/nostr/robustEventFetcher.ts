import NDK, { NDKEvent } from '@nostr-dev-kit/ndk'
import { ResultAsync } from 'neverthrow'
import { CommonRelays } from './commonRelays'

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
        const selectedRelays = this.relayUrls
          .sort(() => Math.random() - 0.5)
          .slice(0, 5)
        for (const relayUrl of selectedRelays) {
          try {
            times++
            await new Promise((resolve) => setTimeout(resolve, 1000))
            console.log(`fetchEvent: relayUrl: ${relayUrl} times: ${times}`)
            event = await this.tryFetchEvent(eventId, relayUrl)
            if (event !== null) {
              console.log(
                `-------------------------\nfetchEvent: event: ${JSON.stringify(event)} times: ${times}\n-------------------------`
              )
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
