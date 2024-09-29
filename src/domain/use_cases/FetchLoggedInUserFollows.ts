import { ResultAsync } from 'neverthrow'
import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'

export class FetchLoggedInUserFollows {
  constructor(private userRepository: UserRepository) {}

  execute(): ResultAsync<User[], Error> {
    return this.userRepository.fetchLoggedInUserFollows()
  }
}
