import { bech32ToHex } from '@/utils/addressConverter'
import { User } from '../entities/User'
import { UserProfileRepository } from '../repositories/UserProfileRepository'
import { ResultAsync } from 'neverthrow'

export class FetchUser {
  constructor(private userProfileRepository: UserProfileRepository) {}

  execute(npub: string): ResultAsync<User, Error> {
    return this.userProfileRepository
      .fetchProfile(npub)
      .andThen((profile) =>
        bech32ToHex(npub).map((pubkey) => new User({ npub, pubkey, profile }))
      )
  }
}
