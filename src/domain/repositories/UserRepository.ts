import { User } from '@/domain/entities/User'
import { Result } from 'neverthrow'

export interface UserRepository {
  login(): Result<User, Error>
  fetchLoggedInUser(): Result<User, Error>
}
