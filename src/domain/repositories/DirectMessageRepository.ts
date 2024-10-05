import { ResultAsync } from 'neverthrow'
import { DirectMessage } from '../entities/DirectMessage'
import { User } from '../entities/User'
import { Conversation } from '../entities/Conversation'
import { Observable } from 'rxjs'

export interface DirectMessageRepository {
  send(message: DirectMessage): ResultAsync<void, Error>
  fetch(id: string): ResultAsync<DirectMessage, Error>
  fetchUserConversations(user: User): ResultAsync<Conversation[], Error>
  subscribeDirectMessages(): Observable<Conversation>
}
