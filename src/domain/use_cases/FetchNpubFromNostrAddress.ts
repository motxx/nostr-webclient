import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'

export class FetchNpubFromNostrAddress {
  constructor(private userProfileRepository: UserProfileRepository) {}

  async execute(nostrAddress: string): Promise<string> {
    const npub =
      await this.userProfileRepository.fetchNpubFromNostrAddress(nostrAddress)
    return npub
  }
}
