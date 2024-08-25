import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { ResultAsync } from 'neverthrow'

export class FetchNpubFromNostrAddress {
  constructor(private userProfileRepository: UserProfileRepository) {}

  execute(nostrAddress: string): ResultAsync<string, Error> {
    return this.userProfileRepository.fetchNpubFromNostrAddress(nostrAddress)
  }
}
