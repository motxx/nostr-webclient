import { UserSettings } from '@/domain/entities/UserSettings'
import { UserSettingsRepository } from '@/domain/repositories/UserSettingsRepository'
import {
  UserFailedToGetSettingsError,
  UserFailedToUpdateSettingsError,
} from '@/infrastructure/errors/serviceErrors'
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
import { unixtime } from '@/infrastructure/nostr/utils'
import { NostrWalletAuth } from '@/infrastructure/nostr/nostrWalletAuth'
import { UserStore } from '../storage/UserStore'
import { NostrClient } from '../nostr/nostrClient'

export class UserSettingsService implements UserSettingsRepository {
  npub: string
  userStore: UserStore
  nostrClient: NostrClient
  nwa?: NostrWalletAuth

  constructor(npub: string, nostrClient: NostrClient) {
    this.npub = npub
    this.nostrClient = nostrClient
    this.userStore = new UserStore(npub)
  }

  async fetchUserSettings(npub: string): Promise<UserSettings> {
    let settings = new UserSettings('', '', 1, 'wss://relay.hakua.xyz') // TODO: Relay URL定数の置き場を考える
    try {
      const s = this.userStore.get(npub)
      if (s !== null) {
        settings = s as UserSettings
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new UserFailedToGetSettingsError(error)
      } else {
        throw new UserFailedToGetSettingsError(new Error())
      }
    }
    return settings
  }

  async updateSettings(
    npub: string,
    settings: UserSettings
  ): Promise<UserSettings> {
    try {
      this.userStore.set(npub, settings)
    } catch (error) {
      if (error instanceof Error) {
        throw new UserFailedToUpdateSettingsError(error)
      } else {
        throw new UserFailedToUpdateSettingsError(new Error())
      }
    }
    return settings
  }

  async subscribeNWARequest(onNWARequest: (connectionUri: string) => void) {
    const cachedEventIds = new Set<string>()
    await this.nostrClient.subscribeEvents(
      {
        kinds: [NDKKind.NWARequest],
        since: unixtime(),
      },
      async (event: NDKEvent) => {
        if (cachedEventIds.has(event.id)) {
          return
        }
        cachedEventIds.add(event.id)
        console.log('NWARequest', event)
        if (!this.nwa) {
          this.nwa = await NostrWalletAuth.connect()
        }
        const connectionUri = await this.nwa.decryptNWARequest(event)
        onNWARequest(connectionUri)
      }
    )
  }
}
