import { UserProfile } from '../entities/UserProfile'

export interface UserProfileRepository {
  fetchProfile(npub: string): Promise<UserProfile>
  fetchNpubFromNostrAddress(nostrAddress: string): Promise<string>
}
