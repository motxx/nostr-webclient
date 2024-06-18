import { User } from '@/domain/entities/User'

export interface UserRepository {
  login(): Promise<User>
  fetch(): Promise<User>
}
