import { ResultAsync } from 'neverthrow'
import { DirectMessage } from '../entities/DirectMessage'
import { User } from '../entities/User'

export interface DirectMessageRepository {
  send(message: DirectMessage): ResultAsync<void, Error>
  fetch(id: string): ResultAsync<DirectMessage, Error>
  fetchConversation(participants: User[]): ResultAsync<DirectMessage[], Error>
}
