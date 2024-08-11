import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { Result } from 'neverthrow'

export class FetchNpubFromNostrAddress {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute(nostrAddress: string): Promise<string> {
    const result: Result<string, Error> =
      await this.userProfileRepository.fetchNpubFromNostrAddress(nostrAddress)

    if (result.isOk()) {
      return result.value
    } else {
      throw result.error
    }
  }
}
