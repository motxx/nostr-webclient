import { bech32ToHex } from '@/utils/addressConverter'
import { User } from '../entities/User'
import { UserProfileRepository } from '../repositories/UserProfileRepository'
import { UserProfile } from '../entities/UserProfile'
import { Result } from 'neverthrow'

export class FetchUser {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute(npub: string): Promise<User> {
    const profileResult: Result<UserProfile, Error> =
      await this.userProfileRepository.fetchProfile(npub)
    if (profileResult.isErr()) {
      throw profileResult.error
    }
    const profile = profileResult.value

    const pubkeyResult = bech32ToHex(npub)
    if (pubkeyResult.isErr()) {
      throw pubkeyResult.error
    }
    const pubkey = pubkeyResult.value

    return new User({
      npub,
      pubkey,
      profile,
    })
  }
}
