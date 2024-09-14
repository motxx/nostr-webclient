import { DirectMessageRepository } from '@/domain/repositories/DirectMessageRepository'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { User } from '@/domain/entities/User'
import { NostrClient } from '../nostr/nostrClient'
import { ResultAsync } from 'neverthrow'
import { NDKFilter } from '@nostr-dev-kit/ndk'
import {
  NDKKind_DirectMessage,
  NDKKind_GiftWrap,
} from '../nostr/kindExtensions'
import { Conversation } from '@/domain/entities/Conversation'
import { Participant } from '@/domain/entities/Participant'
import { bech32ToHex } from '@/utils/addressConverter'

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
          .andThen((giftWrap) => this.nostrClient.postSignedEvent(giftWrap))
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

  fetchUserConversations(user: User): ResultAsync<Conversation[], Error> {
    const filter: NDKFilter = {
      kinds: [NDKKind_GiftWrap as any],
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
              .orElse((error) => {
                console.error('Failed to decrypt gift wrap event', error)
                return ResultAsync.fromSafePromise(
                  Promise.resolve({
                    kind: NDKKind_DirectMessage,
                    content: 'Error decrypting gift wrap event',
                    tags: [],
                    pubkey:
                      '58f4c2db955531458a1077d97d98216a7443cd440c8df07391d18f721d3e15ca',
                    created_at: 0,
                  })
                )
              })
              .andThen(DirectMessage.fromNostrEvent)
          )
        )
      )
      .map((messages) => {
        const groupMessagesByConversation = (
          messages: DirectMessage[]
        ): Map<string, Conversation> => {
          return messages.reduce((conversationMap, message) => {
            const participantsNpubs = new Set([
              message.sender.npub,
              ...message.receivers.map((r) => r.user.npub),
            ])

            const id =
              Array.from(participantsNpubs).sort().join('-') +
              ':' +
              message.subject

            const participants = new Set(
              Array.from(participantsNpubs).map((npub) => {
                return new Participant(
                  new User({ npub, pubkey: bech32ToHex(npub).unwrapOr('') }),
                  'wss://relay.hakua.xyz'
                )
              })
            )

            const conversation =
              conversationMap.get(id) ||
              Conversation.create(participants, message.subject)

            return conversationMap.set(id, conversation.addMessage(message))
          }, new Map<string, Conversation>())
        }

        return Array.from(groupMessagesByConversation(messages).values())
      })
  }
}
