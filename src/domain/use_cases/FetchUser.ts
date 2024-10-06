import { bech32ToHex } from '@/utils/addressConverter'
import { User } from '@/domain/entities/User'
import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { Observable, of, switchMap, throwError } from 'rxjs'
import { joinErrors } from '@/utils/errors'

export class FetchUser {
  constructor(private userProfileRepository: UserProfileRepository) {}

  execute(npub: string): Observable<User> {
    return this.userProfileRepository.fetchProfile(npub).pipe(
      switchMap((profile) => {
        return bech32ToHex(npub).match(
          (pubkey) => of(new User({ npub, pubkey, profile })),
          (error) =>
            throwError(() =>
              joinErrors(new Error(`Failed to parse npub: ${npub}`), error)
            )
        )
      })
    )
  }
}
