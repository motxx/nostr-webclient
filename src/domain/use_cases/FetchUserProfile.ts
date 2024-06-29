import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { UserProfile } from '@/domain/entities/UserProfile'

export class FetchUserProfile {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute(npub: string): Promise<UserProfile> {
    const result = await this.userProfileRepository.fetchProfile(npub)
    if (result.isOk()) {
      return result.value
    } else {
      throw result.error
    }
  }
}
