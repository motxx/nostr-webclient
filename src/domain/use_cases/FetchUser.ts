import { npubToPubkey } from '@/utils/addressConverter'
import { User } from '../entities/User'
import { UserProfileRepository } from '../repositories/UserProfileRepository'

export class FetchUser {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute(npub: string): Promise<User> {
    const profile = await this.userProfileRepository.fetchProfile(npub)
    const pubkey = npubToPubkey(npub)
    return new User({
      npub,
      pubkey,
      profile,
    })
  }
}
