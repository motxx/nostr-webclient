import { ResultAsync } from 'neverthrow'
import { UserProfile } from '../entities/UserProfile'

export interface UserProfileRepository {
  fetchProfile(npub: string): ResultAsync<UserProfile, Error>
  fetchNpubFromNostrAddress(nostrAddress: string): ResultAsync<string, Error>
}
