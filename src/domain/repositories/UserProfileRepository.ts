import { UserProfile } from '../entities/UserProfile'

export interface UserProfileRepository {
  fetchProfile(npub: string): Promise<UserProfile>
}
