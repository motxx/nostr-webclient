import { ResultAsync } from 'neverthrow'
import { Conversation } from '../entities/Conversation'
import { User } from '../entities/User'
import { DirectMessageRepository } from '../repositories/DirectMessageRepository'

export class FetchUserConversations {
  constructor(private directMessageRepository: DirectMessageRepository) {}

  execute(user: User): ResultAsync<Conversation[], Error> {
    return this.directMessageRepository.fetchUserConversations(user)
  }
}
