import { Conversation } from '@/domain/entities/Conversation'
import { DirectMessageRepository } from '@/domain/repositories/DirectMessageRepository'
import { Observable } from 'rxjs'

export class SubscribeDirectMessages {
  constructor(private directMessageRepository: DirectMessageRepository) {}
  execute(): Observable<Conversation> {
    return this.directMessageRepository.subscribeDirectMessages()
  }
}
