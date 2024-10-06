import { DirectMessageRepository } from '@/domain/repositories/DirectMessageRepository'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { User } from '@/domain/entities/User'
import { NostrClient } from '../nostr/nostrClient'
import { ok } from 'neverthrow'
import { NDKFilter } from '@nostr-dev-kit/ndk'
import { NDKKind_GiftWrap } from '../nostr/kindExtensions'
import { Conversation } from '@/domain/entities/Conversation'
import { forkJoin, map, Observable, of, switchMap, throwError } from 'rxjs'
import { joinErrors } from '@/utils/errors'

export class DirectMessageService implements DirectMessageRepository {
  constructor(private nostrClient: NostrClient) {}

  // TODO: 送信できた相手と出来なかった相手を区別可能にする
  send(message: DirectMessage): Observable<void> {
    return forkJoin(
      message.receivers.map((receiver) =>
        this.nostrClient
          .createGiftWrapNostrEvent(
            message.toNostrEvent(),
            receiver.user.pubkey
          )
          .pipe(
            switchMap((giftWrap) => this.nostrClient.postSignedEvent(giftWrap))
          )
      )
    ).pipe(map(() => void 0))
  }

  fetch(id: string): Observable<DirectMessage> {
    return this.nostrClient
      .fetchEvent(id)
      .pipe(
        switchMap((event) =>
          this.nostrClient.decryptGiftWrapNostrEvent(event.rawEvent())
        )
      )
      .pipe(
        switchMap((decryptedEvent) => {
          const result = DirectMessage.fromNostrEvent(decryptedEvent)
          if (result.isErr()) {
            return throwError(() => result.error)
          }
          return of(result.value)
        })
      )
  }

  fetchUserConversations(user: User): Observable<Conversation> {
    const filter: NDKFilter = {
      kinds: [NDKKind_GiftWrap as any],
      '#p': [user.pubkey],
      limit: 1000,
    }

    return this.nostrClient.fetchEvents(filter).pipe(
      switchMap((event) =>
        this.nostrClient.decryptGiftWrapNostrEvent(event.rawEvent()).pipe(
          switchMap((decryptedEvent) => {
            const message = DirectMessage.fromNostrEvent(decryptedEvent)
            return message.match(
              (message) => {
                const participants = message.createParticipants()
                return participants.match(
                  (participants) => {
                    const conversation = Conversation.create(
                      participants,
                      message.subject ?? ''
                    )
                    conversation.addMessage(message)
                    return of(conversation)
                  },
                  (error) => {
                    return throwError(() =>
                      joinErrors(
                        new Error('Failed to create participants'),
                        error
                      )
                    )
                  }
                )
              },
              (error) => {
                return throwError(() =>
                  joinErrors(new Error('Failed to parse nostr event'), error)
                )
              }
            )
          })
        )
      )
    )
  }

  subscribeDirectMessages(): Observable<Conversation> {
    return this.nostrClient.getLoggedInUser().match(
      (user) => {
        return this.nostrClient
          .subscribeEvents({
            kinds: [NDKKind_GiftWrap as any],
            '#p': [user.pubkey],
            limit: 1000,
          })
          .pipe(
            switchMap((ndkEvent) => {
              return this.nostrClient
                .decryptGiftWrapNostrEvent(ndkEvent.rawEvent())
                .pipe(
                  switchMap((decryptedEvent) => {
                    return DirectMessage.fromNostrEvent(decryptedEvent).match(
                      (message) => {
                        return message.createParticipants().match(
                          (participants) => {
                            const conversation = Conversation.create(
                              participants,
                              message.subject ?? ''
                            )
                            return of(conversation.addMessage(message))
                          },
                          (error) =>
                            throwError(() =>
                              joinErrors(
                                new Error('Failed to create participants'),
                                error
                              )
                            )
                        )
                      },
                      (error) =>
                        throwError(() =>
                          joinErrors(
                            new Error('Failed to parse nostr event'),
                            error
                          )
                        )
                    )
                  })
                )
            })
          )
      },
      (error) =>
        throwError(() =>
          joinErrors(new Error('Failed to get logged-in user'), error)
        )
    )
  }
}
