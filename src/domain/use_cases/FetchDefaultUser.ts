import { ResultAsync } from 'neverthrow'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { User } from '@/domain/entities/User'

export class FetchDefaultUser {
  #userRepository: UserRepository

  constructor(userRepository: UserRepository) {
    this.#userRepository = userRepository
  }

  execute(): ResultAsync<User, Error> {
    return this.#userRepository.fetchDefaultUser()
  }
}
