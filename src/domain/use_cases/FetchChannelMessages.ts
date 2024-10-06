import { PublicChatRepository } from '@/domain/repositories/PublicChatRepository'
import { PublicChatMessage } from '@/domain/entities/PublicChat'
import { Observable } from 'rxjs'

export class FetchChannelMessages {
  constructor(private publicChatRepository: PublicChatRepository) {}

  execute(channelId: string): Observable<PublicChatMessage> {
    return this.publicChatRepository.fetchChannelMessages(channelId)
  }
}
