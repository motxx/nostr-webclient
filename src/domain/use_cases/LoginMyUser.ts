import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { Result } from 'neverthrow'

export class LoginMyUser {
  constructor(private userRepository: UserRepository) {}

  execute(): Result<User, Error> {
    return this.userRepository.login()
  }
}
