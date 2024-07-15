import { PublicChatRepository } from '@/domain/repositories/PublicChatRepository'

export class PostChannelMessage {
  constructor(private publicChatRepository: PublicChatRepository) {}

  async execute(channelId: string, content: string): Promise<void> {
    const result = await this.publicChatRepository.postChannelMessage(
      channelId,
      content
    )
    if (result.isErr()) {
      throw result.error
    }
  }
}
