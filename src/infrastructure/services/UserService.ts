import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { NDKUser } from '@nostr-dev-kit/ndk'
import { hexToBech32 } from '@/utils/addressConverter'
import {
  catchError,
  EMPTY,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
  throwError,
} from 'rxjs'

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

  private createUserFromNDKUser(ndkUser: NDKUser): Observable<User> {
    return this.#nostrClient.getUserWithProfile(ndkUser.npub).pipe(
      map((_) => {
        const userName = ndkUser.profile?.displayName || ndkUser.profile?.name
        return new User({
          npub: ndkUser.npub,
          pubkey: ndkUser.pubkey,
          profile: {
            name: userName,
            image: ndkUser.profile?.image,
            nostrAddress: ndkUser.profile?.nip05,
          },
        })
      })
    )
  }

  login(): Observable<User> {
    const ndkUserResult = this.#nostrClient.getLoggedInUser()
    if (ndkUserResult.isErr()) {
      return throwError(() => ndkUserResult.error)
    }
    const ndkUser = ndkUserResult.value
    return this.createUserFromNDKUser(ndkUser)
  }

  fetchLoggedInUserFollows(): Observable<User[]> {
    return this.login()
      .pipe(
        switchMap((user) => this.#nostrClient.fetchFollowingUsers(user.npub))
      )
      .pipe(
        switchMap((users) =>
          forkJoin(users.map((user) => this.createUserFromNDKUser(user)))
        )
      )
  }

  fetchDefaultUser(): Observable<User> {
    const npubResult = hexToBech32(NostrClient.JapaneseUserBot, 'npub')
    if (npubResult.isErr()) {
      return throwError(() => npubResult.error)
    }
    const npub = npubResult.value
    return of(npub).pipe(
      switchMap((npub) => this.#nostrClient.getUserWithProfile(npub)),
      switchMap((ndkUser) => this.createUserFromNDKUser(ndkUser)),
      switchMap((user) =>
        this.#nostrClient.fetchFollowingUsers(user.npub).pipe(
          switchMap((followingNDKUsers: NDKUser[]) =>
            forkJoin(
              followingNDKUsers.map((ndkUser) =>
                this.createUserFromNDKUser(ndkUser).pipe(
                  catchError(() => EMPTY)
                )
              )
            )
          ),
          map((users: User[]) => users.filter(Boolean)), // 取得できたユーザのみを残す
          map((users: User[]) => {
            user.followingUsers = users
            return user
          })
        )
      ),
      catchError((error) => {
        console.log('Failed to fetch default user:', error)
        return of(
          new User({
            npub: NostrClient.JapaneseUserBot,
            pubkey: '',
            profile: {
              name: 'Unknown User',
              image: '',
              nostrAddress: '',
            },
          })
        )
      })
    )
  }

  sendZapRequest(
    nip05Id: string,
    sats: number
  ): Observable<SendZapRequestResponse> {
    return this.login().pipe(
      switchMap(() => this.#nostrClient.sendZapRequest(nip05Id, sats)),
      map((result) => ({ pr: result.pr, verify: result.verify }))
    )
  }
}
