import { User } from '@/domain/entities/User'
import { ResultAsync } from 'neverthrow'

export interface UserRepository {
  login(): ResultAsync<User, Error>
}
