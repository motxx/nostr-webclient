import {
  DirectMessageRepository,
  SubscribeDirectMessagesOptions,
} from '@/domain/repositories/DirectMessageRepository'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { User } from '@/domain/entities/User'
import { NostrClient } from '../nostr/nostrClient'
import { Result, ResultAsync } from 'neverthrow'
import { NDKFilter } from '@nostr-dev-kit/ndk'
import {
  NDKKind_DirectMessage,
  NDKKind_GiftWrap,
} from '../nostr/kindExtensions'
import { Conversation } from '@/domain/entities/Conversation'
import { Participant } from '@/domain/entities/Participant'
import { hexToBech32 } from '@/utils/addressConverter'

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
            // TODO: Use message.createParticipants()
            const participantPubkeys = Array.from(
              new Set([
                message.sender.pubkey,
                ...message.receivers.map((r) => r.user.pubkey),
              ])
            )

            const participants = new Set(
              participantPubkeys.map((pubkey) => {
                return new Participant(
                  new User({
                    pubkey,
                    npub: hexToBech32(pubkey).unwrapOr(''),
                  })
                )
              })
            )

            const id = Conversation.generateId(
              participantPubkeys,
              message.subject ?? ''
            )

            const conversation =
              conversationMap.get(id) ||
              Conversation.create(participants, message.subject ?? '')

            return conversationMap.set(id, conversation.addMessage(message))
          }, new Map<string, Conversation>())
        }

        return Array.from(groupMessagesByConversation(messages).values())
      })
  }

  subscribeDirectMessages(
    onConversation: (conversation: Conversation) => void,
    options?: SubscribeDirectMessagesOptions
  ): Result<{ unsubscribe: () => void }, Error> {
    return this.nostrClient.getLoggedInUser().andThen((user) =>
      this.nostrClient.subscribeEvents(
        {
          kinds: [NDKKind_GiftWrap as any],
          '#p': [user.pubkey],
          limit: 1000,
        },
        (event) => {
          this.nostrClient
            .decryptGiftWrapNostrEvent(event.rawEvent())
            .andThen((decryptedEvent) =>
              DirectMessage.fromNostrEvent(decryptedEvent)
            )
            .match(
              (message) => {
                message.createParticipants().match(
                  (participants) => {
                    onConversation(
                      Conversation.create(
                        participants,
                        message.subject ?? ''
                      ).addMessage(message)
                    )
                  },
                  (error) => {
                    console.error(
                      'subscribeDirectMessages: onEvent: createParticipants:',
                      error
                    )
                  }
                )
              },
              (error) => {
                console.error('subscribeDirectMessages: onEvent', error)
              }
            )
        }
      )
    )
  }
}
