import { UserRepository } from '@/domain/repositories/UserRepository'
import { User } from '@/domain/entities/User'
import { Observable } from 'rxjs'

export class FetchDefaultUser {
  #userRepository: UserRepository

  constructor(userRepository: UserRepository) {
    this.#userRepository = userRepository
  }

  execute(): Observable<User> {
    return this.#userRepository.fetchDefaultUser()
  }
}
