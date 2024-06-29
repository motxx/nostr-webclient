import { ResultAsync, err, Result } from 'neverthrow'
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

  login(): Result<User, Error> {
    return this.#nostrClient.getLoggedInUser().map((user) => {
      this.#userStore = new UserStore(user.npub)
      const userName = user.profile?.displayName || user.profile?.name
      const userImage = user.profile?.image
      return new User({
        npub: user.npub,
        pubkey: user.pubkey,
        profile: { name: userName, image: userImage },
      })
    })
  }

  #ensureLoggedIn(): Result<void, Error> {
    return this.login().map(() => void 0)
  }

  fetchLoggedInUser(): Result<User, Error> {
    return this.#ensureLoggedIn()
      .andThen(() => {
        if (!this.#isLoggedIn()) {
          return err(new UserNotLoggedInError())
        }
        return this.#nostrClient.getLoggedInUser()
      })
      .map((user) => {
        const userName = user.profile?.displayName || user.profile?.name
        const userImage = user.profile?.image
        return new User({
          npub: user.npub,
          pubkey: user.pubkey,
          profile: { name: userName, image: userImage },
        })
      })
  }

  sendZapRequest(nip05Id: string, sats: number) {
    return this.#ensureLoggedIn().asyncAndThen(() => {
      if (!this.#isLoggedIn()) {
        return ResultAsync.fromPromise(
          Promise.resolve(err(new UserNotLoggedInError())),
          () => new Error()
        )
      }
      return this.#nostrClient.sendZapRequest(nip05Id, sats)
    })
  }

  #isLoggedIn(): this is {
    '#nostrClient': NostrClient
    '#userStore': UserStore
  } {
    return this.#nostrClient !== undefined && this.#userStore !== undefined
  }
}
