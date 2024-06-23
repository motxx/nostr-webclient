import { User } from '@/domain/entities/User'

export interface UserRepository {
  login(): Promise<User>
  fetchLoggedInUser(): Promise<User>
  fetchNpubFromNostrAddress(nostrAddress: string): Promise<string | null>
}
