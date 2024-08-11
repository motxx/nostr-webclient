import { DirectMessageRepository } from '@/domain/repositories/DirectMessageRepository'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { User } from '@/domain/entities/User'
import { NostrClient } from '../nostr/nostrClient'
import { ResultAsync } from 'neverthrow'
import { NDKFilter } from '@nostr-dev-kit/ndk'
import { NDKKind_GiftWrap } from '../nostr/kindExtensions'

export class DirectMessageService implements DirectMessageRepository {
  constructor(private nostrClient: NostrClient) {}

  send(message: DirectMessage): ResultAsync<void, Error> {
    return ResultAsync.combine(
      message.receivers.map((receiver) =>
        this.nostrClient
          .createGiftWrapNostrEvent(
            message.toNostrEvent(),
            receiver.user.pubkey
          )
          .andThen((giftWrap) => this.nostrClient.postEvent(giftWrap))
      )
    ).map(() => void 0)
  }

  fetch(id: string): ResultAsync<DirectMessage, Error> {
    return this.nostrClient
      .fetchEvent(id)
      .andThen((event) =>
        this.nostrClient.decryptGiftWrapNostrEvent(event.rawEvent())
      )
      .andThen((decryptedEvent) => DirectMessage.fromNostrEvent(decryptedEvent))
  }

  fetchConversation(participants: User[]): ResultAsync<DirectMessage[], Error> {
    const pubkeys = participants.map((user) => user.pubkey)
    const filter: NDKFilter = {
      kinds: [NDKKind_GiftWrap as any],
      authors: pubkeys,
      '#p': pubkeys,
      limit: 100,
    }

    return this.nostrClient
      .fetchEvents(filter)
      .andThen((events) =>
        ResultAsync.combine(
          events.map((event) =>
            this.nostrClient
              .decryptGiftWrapNostrEvent(event.rawEvent())
              .andThen(DirectMessage.fromNostrEvent)
          )
        )
      )
      .map((messages) =>
        messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      )
  }
}