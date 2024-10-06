import { Observable } from 'rxjs'
import { Conversation } from '../entities/Conversation'
import { User } from '../entities/User'
import { DirectMessageRepository } from '../repositories/DirectMessageRepository'

export class FetchUserConversations {
  constructor(private directMessageRepository: DirectMessageRepository) {}

  execute(user: User): Observable<Conversation> {
    return this.directMessageRepository.fetchUserConversations(user)
  }
}
