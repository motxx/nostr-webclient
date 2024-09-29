import { errAsync, ok, ResultAsync } from 'neverthrow'
import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { NDKUser } from '@nostr-dev-kit/ndk'

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
          profile: {
            name: userName,
            image: ndkUser.profile?.image,
            nostrAddress: ndkUser.profile?.nip05,
          },
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
    return this.createUserFromNDKUser(ndkUser)
  }

  fetchLoggedInUserFollows(): ResultAsync<User[], Error> {
    return this.login()
      .andThen(() => this.#nostrClient.fetchLoggedInUserFollows())
      .andThen((users) =>
        ResultAsync.combine(
          users.map((user) => this.createUserFromNDKUser(user))
        )
      )
  }

  sendZapRequest(
    nip05Id: string,
    sats: number
  ): ResultAsync<SendZapRequestResponse, Error> {
    return this.login().andThen(() =>
      this.#nostrClient.sendZapRequest(nip05Id, sats)
    )
  }
}
