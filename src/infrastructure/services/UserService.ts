import { err, ok, Result, ResultAsync } from 'neverthrow'
import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { UserStore } from '@/infrastructure/storage/UserStore'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { NDKUser } from '@nostr-dev-kit/ndk'
import { UserNotLoggedInError } from '../errors/serviceErrors'

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

  private createUserFromNDKUser(user: NDKUser): User {
    const userName = user.profile?.displayName || user.profile?.name
    return new User({
      npub: user.npub,
      pubkey: user.pubkey,
      profile: { name: userName, image: user.profile?.image },
    })
  }

  login(): Result<User, Error> {
    return this.#nostrClient.getLoggedInUser().map((ndkUser) => {
      this.#userStore = new UserStore(ndkUser.npub)
      const user = this.createUserFromNDKUser(ndkUser)
      this.#userStore.set('loggedInUser', JSON.stringify(user))
      return user
    })
  }

  fetchLoggedInUser(): Result<User, Error> {
    if (this.#isLoggedIn()) {
      const userJson = this.#userStore!.get('loggedInUser')
      if (userJson) {
        const user = JSON.parse(userJson) as User
        return ok(user)
      }
    }
    return err(new UserNotLoggedInError())
  }

  sendZapRequest(
    nip05Id: string,
    sats: number
  ): ResultAsync<SendZapRequestResponse, Error> {
    return this.login().asyncAndThen(() =>
      this.#nostrClient.sendZapRequest(nip05Id, sats)
    )
  }

  #isLoggedIn() {
    return (
      this.#userStore !== undefined &&
      this.#userStore.get('loggedInUser') !== undefined
    )
  }
}
