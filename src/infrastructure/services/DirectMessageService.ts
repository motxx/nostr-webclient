import { DirectMessageRepository } from '@/domain/repositories/DirectMessageRepository'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { User } from '@/domain/entities/User'
import { NostrClient } from '../nostr/nostrClient'
import { ok, Result, ResultAsync } from 'neverthrow'
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

  // TODO: 送信できた相手と出来なかった相手を区別可能にする
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
            const participants = message
              .createParticipants()
              .andThen((participants) => {
                console.error("FIXME: Don't ignore error")
                return ok(participants)
              })
              .unwrapOr(new Set<Participant>())

            const id = Conversation.generateId(
              Array.from(participants).map((p) => p.user.pubkey),
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
    onConversation: (conversation: Conversation) => void
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
