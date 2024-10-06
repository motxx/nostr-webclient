import { PublicChannel, PublicChatMessage } from '../entities/PublicChat'
import { Observable } from 'rxjs'

export interface PublicChatRepository {
  fetchChannels(): Observable<PublicChannel>
  fetchChannelMessages(channelId: string): Observable<PublicChatMessage>
  postChannelMessage(channelId: string, content: string): Observable<void>
  subscribeToChannelMessages(
    channelId: string,
    options?: {
      limit?: number
      until?: Date
      isForever?: boolean
    }
  ): Observable<PublicChatMessage>
}
