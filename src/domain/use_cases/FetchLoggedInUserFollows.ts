import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { Observable } from 'rxjs'

export class FetchLoggedInUserFollows {
  constructor(private userRepository: UserRepository) {}

  execute(): Observable<User[]> {
    return this.userRepository.fetchLoggedInUserFollows()
  }
}
