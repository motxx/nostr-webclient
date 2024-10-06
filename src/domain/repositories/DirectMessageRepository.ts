import { DirectMessage } from '../entities/DirectMessage'
import { User } from '../entities/User'
import { Conversation } from '../entities/Conversation'
import { Observable } from 'rxjs'

export interface DirectMessageRepository {
  send(message: DirectMessage): Observable<void>
  fetch(id: string): Observable<DirectMessage>
  fetchUserConversations(user: User): Observable<Conversation>
  subscribeDirectMessages(): Observable<Conversation>
}
