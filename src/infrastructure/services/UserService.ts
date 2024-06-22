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
    const user = await this.#nostrClient.getLoggedInUser()
    this.#userStore = new UserStore(user.npub)
    const userName = user.profile?.displayName || user.profile?.name
    const userImage = user.profile?.image
    return new User({
      npub: user.npub,
      pubkey: user.pubkey,
      profile: { name: userName, image: userImage },
    })
  }

  async #ensureLoggedIn() {
    this.login()
  }

  async fetchLoggedInUser(): Promise<User> {
    await this.#ensureLoggedIn()
    if (!this.#isLoggedIn()) {
      throw new UserNotLoggedInError()
    }
    const user = await this.#nostrClient.getLoggedInUser()
    const userName = user.profile?.displayName || user.profile?.name
    const userImage = user.profile?.image
    return new User({
      npub: user.npub,
      pubkey: user.pubkey,
      profile: { name: userName, image: userImage },
    })
  }
  /*
  async fetchUser(npub: string): Promise<User> {
    await this.#ensureLoggedIn()
    if (!this.#isLoggedIn()) {
      throw new UserNotLoggedInError()
    }
    const user = await this.#nostrClient.getUser(npub)
    const pubkey = user.pubkey
    const name = user.profile?.displayName || user.profile?.name
    const image = user.profile?.image
    return new User({
      npub,
      pubkey,
      profile: { name, image },
    })
  }
*/

  async sendZapRequest(
    nip05Id: string,
    sats: number
  ): Promise<SendZapRequestResponse> {
    await this.#ensureLoggedIn()
    if (!this.#isLoggedIn()) {
      throw new UserNotLoggedInError()
    }

    return this.#nostrClient.sendZapRequest(nip05Id, sats)
  }

  #isLoggedIn(): this is {
    '#nostrClient': NostrClient
    '#userStore': UserStore
  } {
    return this.#nostrClient !== undefined && this.#userStore !== undefined
  }
}
