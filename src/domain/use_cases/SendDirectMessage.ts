import { DirectMessageRepository } from '@/domain/repositories/DirectMessageRepository'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { Observable } from 'rxjs'

export class SendDirectMessage {
  constructor(private directMessageRepository: DirectMessageRepository) {}

  execute(message: DirectMessage): Observable<void> {
    return this.directMessageRepository.send(message)
  }
}
