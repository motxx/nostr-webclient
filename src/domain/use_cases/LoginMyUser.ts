import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { ok, ResultAsync } from 'neverthrow'
import { UserProfileRepository } from '../repositories/UserProfileRepository'

export class LoginMyUser {
  constructor(
    private userRepository: UserRepository,
    private userProfileRepository: UserProfileRepository
  ) {}

  execute(): ResultAsync<User, Error> {
    return this.userRepository.login().andThen((user) => {
      return this.userProfileRepository
        .fetchProfile(user.npub)
        .andThen((profile) => {
          user.profile = profile
          return ok(user)
        })
    })
  }
}
