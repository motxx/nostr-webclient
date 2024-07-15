import { Result, ResultAsync } from 'neverthrow'
import { PublicChannel, PublicChatMessage } from '../entities/PublicChat'

export interface PublicChatRepository {
  fetchChannels(): ResultAsync<PublicChannel[], Error>
  fetchChannelMessages(
    channelId: string
  ): ResultAsync<PublicChatMessage[], Error>
  postChannelMessage(
    channelId: string,
    content: string
  ): ResultAsync<void, Error>
  subscribeToChannelMessages(
    channelId: string,
    onMessage: (message: PublicChatMessage) => void,
    options?: {
      limit?: number
      until?: Date
      isForever?: boolean
    }
  ): Result<{ unsubscribe: () => void }, Error>
}
