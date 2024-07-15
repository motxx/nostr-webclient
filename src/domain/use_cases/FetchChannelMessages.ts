import { PublicChatRepository } from '@/domain/repositories/PublicChatRepository'
import { PublicChatMessage } from '@/domain/entities/PublicChat'

export class FetchChannelMessages {
  constructor(private publicChatRepository: PublicChatRepository) {}

  async execute(channelId: string): Promise<PublicChatMessage[]> {
    const result =
      await this.publicChatRepository.fetchChannelMessages(channelId)
    if (result.isOk()) {
      return result.value
    } else {
      throw result.error
    }
  }
}
