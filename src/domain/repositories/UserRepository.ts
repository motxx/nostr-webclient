import { User } from '@/domain/entities/User'
import { Result, ResultAsync } from 'neverthrow'

export interface UserRepository {
  login(): ResultAsync<User, Error>
  fetchLoggedInUser(): Result<User, Error>
}
