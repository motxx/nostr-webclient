import { DirectMessageRepository } from '@/domain/repositories/DirectMessageRepository'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { ResultAsync } from 'neverthrow'

export class SendDirectMessage {
  constructor(private directMessageRepository: DirectMessageRepository) {}

  execute(message: DirectMessage): ResultAsync<void, Error> {
    return this.directMessageRepository.send(message)
  }
}
