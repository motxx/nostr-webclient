import { Conversation } from '@/domain/entities/Conversation'
import {
  DirectMessageRepository,
  SubscribeDirectMessagesOptions,
} from '@/domain/repositories/DirectMessageRepository'
import { Result } from 'neverthrow'

export class SubscribeDirectMessages {
  constructor(private directMessageRepository: DirectMessageRepository) {}
  execute(
    onConversation: (conversation: Conversation) => void,
    options?: SubscribeDirectMessagesOptions
  ): Result<{ unsubscribe: () => void }, Error> {
    return this.directMessageRepository.subscribeDirectMessages(
      onConversation,
      options
    )
  }
}
