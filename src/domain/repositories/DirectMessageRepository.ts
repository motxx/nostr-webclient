import { Result, ResultAsync } from 'neverthrow'
import { DirectMessage } from '../entities/DirectMessage'
import { User } from '../entities/User'
import { Conversation } from '../entities/Conversation'

export interface DirectMessageRepository {
  send(message: DirectMessage): ResultAsync<void, Error>
  fetch(id: string): ResultAsync<DirectMessage, Error>
  fetchUserConversations(user: User): ResultAsync<Conversation[], Error>
  subscribeDirectMessages(
    onConversation: (conversation: Conversation) => void
  ): Result<{ unsubscribe: () => void }, Error>
}
