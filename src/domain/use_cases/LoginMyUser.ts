import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { map, Observable, switchMap, zip } from 'rxjs'

export class LoginMyUser {
  constructor(
    private userRepository: UserRepository,
    private userProfileRepository: UserProfileRepository
  ) {}

  execute(): Observable<User> {
    return this.userRepository.login().pipe(
      switchMap((user) =>
        zip(
          this.userProfileRepository.fetchProfile(user.npub),
          this.userRepository.fetchLoggedInUserFollows()
        ).pipe(
          map(([profile, follows]) => ({
            ...user,
            profile,
            followingUsers: follows,
          }))
        )
      )
    )
  }
}
