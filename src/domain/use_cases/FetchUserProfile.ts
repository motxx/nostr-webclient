import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { UserProfile } from '@/domain/entities/UserProfile'

export class FetchUserProfile {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute(npub: string): Promise<UserProfile> {
    const profile = await this.userProfileRepository.fetchProfile(npub)
    return profile
  }
}
