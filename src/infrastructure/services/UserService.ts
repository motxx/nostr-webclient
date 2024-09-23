import { err, errAsync, ok, Result, ResultAsync } from 'neverthrow'
import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { UserStore } from '@/infrastructure/storage/UserStore'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { NDKUser } from '@nostr-dev-kit/ndk'
import { UserNotLoggedInError } from '../errors/serviceErrors'
import { eventBus } from '@/utils/eventBus'

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

  private createUserFromNDKUser(ndkUser: NDKUser): ResultAsync<User, Error> {
    return this.#nostrClient.getUserWithProfile(ndkUser.npub).andThen((_) => {
      const userName = ndkUser.profile?.displayName || ndkUser.profile?.name
      return ok(
        new User({
          npub: ndkUser.npub,
          pubkey: ndkUser.pubkey,
          profile: { name: userName, image: ndkUser.profile?.image },
        })
      )
    })
  }

  login(): ResultAsync<User, Error> {
    const ndkUserResult = this.#nostrClient.getLoggedInUser()
    if (ndkUserResult.isErr()) {
      return errAsync(ndkUserResult.error)
    }
    const ndkUser = ndkUserResult.value
    return this.createUserFromNDKUser(ndkUser).andThen((user) => {
      this.#userStore = new UserStore(ndkUser.npub)
      this.#userStore.set('loggedInUser', JSON.stringify(user))
      eventBus.emit('login', { user })
      return ok(user)
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
