import { PublicChatRepository } from '../repositories/PublicChatRepository'
import { PublicChannel } from '../entities/PublicChat'
import { Observable } from 'rxjs'

export class FetchChannels {
  constructor(private publicChatRepository: PublicChatRepository) {}

  execute(): Observable<PublicChannel> {
    return this.publicChatRepository.fetchChannels()
  }
}
