import { DirectMessageRepository } from '@/domain/repositories/DirectMessageRepository'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { User } from '@/domain/entities/User'
import { NostrClient } from '../nostr/nostrClient'
import { ok, ResultAsync } from 'neverthrow'
import { NDKFilter } from '@nostr-dev-kit/ndk'
import { NDKKind_GiftWrap } from '../nostr/kindExtensions'
import { Conversation } from '@/domain/entities/Conversation'
import { Participant } from '@/domain/entities/Participant'

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

  fetchConversation(participants: User[]): ResultAsync<Conversation, Error> {
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
      .map((messages) => {
        const conversation = Conversation.create(
          new Set([
            new Participant(messages[0].sender, 'wss://relay.hakua.xyz'),
            ...messages.flatMap((message) => message.receivers),
          ]),
          messages[0].subject
        )
        return messages.reduce(
          (conversation, message) => conversation.addMessage(message),
          conversation
        )
      })
  }

  fetchUserConversations(user: User): ResultAsync<Conversation[], Error> {
    const filter: NDKFilter = {
      kinds: [NDKKind_GiftWrap as any],
      authors: [user.pubkey],
      '#p': [user.pubkey],
      limit: 1000,
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
      .map((messages) => {
        const conversationMap = new Map<string, Conversation>()

        messages.forEach((message) => {
          const participants = new Set(message.receivers)
          participants.add(
            new Participant(message.sender, 'wss://relay.hakua.xyz') // TODO: Relay URL定数の置き場を考える
          )
          const conversationId = Array.from(participants)
            .map((p) => p.user.pubkey)
            .sort()
            .join('-')

          if (!conversationMap.has(conversationId)) {
            conversationMap.set(
              conversationId,
              Conversation.create(participants, message.subject)
            )
          }

          const conversation = conversationMap.get(conversationId)!
          conversationMap.set(conversationId, conversation.addMessage(message))
        })

        return Array.from(conversationMap.values())
      })
  }
}
