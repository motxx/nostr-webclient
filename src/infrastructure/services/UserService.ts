import { User } from '@/domain/entities/User'
import { UserSettings } from '@/domain/entities/UserSettings'
import {
  UserRepository,
  UserSettingsRepository,
} from '@/domain/repositories/UserRepository'
import { UserStore } from '@/infrastructure/storage/UserStore'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import {
  UserFailedToConnectError,
  UserFailedToGetSettingsError,
  UserFailedToUpdateSettingsError,
  UserNotLoggedInError,
} from '@/infrastructure/errors/serviceErrors'
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
import { unixtime } from '@/infrastructure/nostr/utils'
import { NostrWalletAuth } from '@/infrastructure/nostr/nostrWalletAuth'

export interface SendZapRequestResponse {
  pr: string
  verify: string
  successAction?: {
    tag: string
    message?: string
  }
}

export class UserService implements UserRepository, UserSettingsRepository {
  nostrClient?: NostrClient
  userStore?: UserStore
  nwa?: NostrWalletAuth

  async login(): Promise<User> {
    this.nostrClient = await NostrClient.connect().catch((error) => {
      throw new UserFailedToConnectError(error)
    })
    const npub = await this.nostrClient.getNpub()
    const pubkey = await this.nostrClient.getPublicKey()
    this.userStore = new UserStore(npub)
    const userName = (await this.nostrClient.getUserName()) || ''
    const userImage = (await this.nostrClient.getUserImage()) || ''
    const settings = await this.fetchUserSettings(npub)
    return new User(npub, pubkey, userName, userImage, settings)
  }

  async fetch(): Promise<User> {
    if (!this.#isLoggedIn()) {
      throw new UserNotLoggedInError()
    }
    const npub = await this.nostrClient.getNpub()
    const pubkey = await this.nostrClient.getPublicKey()
    const userName = (await this.nostrClient.getUserName()) || ''
    const userImage = (await this.nostrClient.getUserImage()) || ''
    const settings = await this.fetchUserSettings(npub)
    return new User(npub, pubkey, userName, userImage, settings)
  }

  async fetchUserSettings(npub: string): Promise<UserSettings> {
    if (!this.#isLoggedIn()) {
      throw new UserNotLoggedInError()
    }

    let settings = new UserSettings('', '', 1)
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
    if (!this.#isLoggedIn()) {
      throw new UserNotLoggedInError()
    }

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
    if (!this.nostrClient) {
      throw new UserNotLoggedInError()
    }

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

  async sendZapRequest(
    nip05Id: string,
    sats: number
  ): Promise<SendZapRequestResponse> {
    if (!this.#isLoggedIn()) {
      throw new UserNotLoggedInError()
    }

    return this.nostrClient.sendZapRequest(nip05Id, sats)
  }

  #isLoggedIn(): this is { nostrClient: NostrClient; userStore: UserStore } {
    return this.nostrClient !== undefined && this.userStore !== undefined
  }
}
