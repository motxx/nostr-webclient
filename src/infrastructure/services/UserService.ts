import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { UserStore } from '@/infrastructure/storage/UserStore'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { UserNotLoggedInError } from '@/infrastructure/errors/serviceErrors'

export interface SendZapRequestResponse {
  pr: string
  verify: string
  successAction?: {
    tag: string
    message?: string
  }
}

export class UserService implements UserRepository {
  #nostrClient: NostrClient
  #userStore?: UserStore

  constructor(nostrClient: NostrClient) {
    this.#nostrClient = nostrClient
  }

  async login(): Promise<User> {
    const npub = await this.#nostrClient.getLoggedInUserNpub()
    const pubkey = await this.#nostrClient.getLoggedInUserPubkey()
    this.#userStore = new UserStore(npub)
    const userName = (await this.#nostrClient.getLoggedInUserName()) || ''
    const userImage = (await this.#nostrClient.getLoggedInUserImage()) || ''
    return new User({
      npub,
      pubkey,
      profile: { name: userName, image: userImage },
    })
  }

  async fetch(): Promise<User> {
    if (!this.#isLoggedIn()) {
      throw new UserNotLoggedInError()
    }
    const npub = await this.nostrClient.getLoggedInUserNpub()
    const pubkey = await this.nostrClient.getLoggedInUserPubkey()
    const userName = (await this.nostrClient.getLoggedInUserName()) || ''
    const userImage = (await this.nostrClient.getLoggedInUserImage()) || ''
    return new User({
      npub,
      pubkey,
      profile: { name: userName, image: userImage },
    })
  }

  async sendZapRequest(
    nip05Id: string,
    sats: number
  ): Promise<SendZapRequestResponse> {
    if (!this.#isLoggedIn()) {
      throw new UserNotLoggedInError()
    }

    return this.#nostrClient.sendZapRequest(nip05Id, sats)
  }

  #isLoggedIn(): this is { nostrClient: NostrClient; userStore: UserStore } {
    return this.#nostrClient !== undefined && this.#userStore !== undefined
  }
}
