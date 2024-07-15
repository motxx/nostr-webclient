import { PublicChatRepository } from '../repositories/PublicChatRepository'
import { PublicChannel } from '../entities/PublicChat'

export class FetchChannels {
  constructor(private publicChatRepository: PublicChatRepository) {}

  async execute(): Promise<PublicChannel[]> {
    const result = await this.publicChatRepository.fetchChannels()
    if (result.isOk()) {
      return result.value
    } else {
      throw result.error
    }
  }
}
