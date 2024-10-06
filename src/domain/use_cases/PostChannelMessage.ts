import { PublicChatRepository } from '@/domain/repositories/PublicChatRepository'
import { Observable } from 'rxjs'

export class PostChannelMessage {
  constructor(private publicChatRepository: PublicChatRepository) {}

  execute(channelId: string, content: string): Observable<void> {
    return this.publicChatRepository.postChannelMessage(channelId, content)
  }
}
