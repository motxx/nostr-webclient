import { Result, ResultAsync, err } from 'neverthrow'
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
import {
  Notification,
  NotificationReactionType,
} from '@/domain/entities/Notification'
import {
  NotificationRepository,
  SubscribeNotificationsOptions,
} from '@/domain/repositories/NotificationRepository'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { NoteService } from '@/infrastructure/services/NoteService'
import { decode } from 'light-bolt11-decoder'
import { Observable } from 'rxjs'

export class NotificationService implements NotificationRepository {
  constructor(
    private nostrClient: NostrClient,
    private userProfileRepository: UserProfileRepository,
    private noteService: NoteService
  ) {}

  fetchPastNotifications(
    options?: SubscribeNotificationsOptions
  ): ResultAsync<Notification[], Error> {
    return this.nostrClient
      .getLoggedInUser()
      .asyncAndThen((user) => {
        return this.nostrClient
          .fetchEvents({
            kinds: [
              NDKKind.Reaction,
              NDKKind.Text,
              NDKKind.Repost,
              NDKKind.Zap,
            ],
            '#p': [user.pubkey],
            since: options?.since
              ? Math.floor(options.since.getTime() / 1000)
              : undefined,
            until: options?.until
              ? Math.floor(options.until.getTime() / 1000)
              : undefined,
            limit: options?.limit ?? 20,
          })
          .map((events) => ({ events, user }))
      })
      .andThen(({ events, user }) => {
        return ResultAsync.combine(
          events
            // Exclude user's own posts
            .filter((event) => event.author.pubkey !== user.pubkey)
            .map((event) => this.createNotificationFromEvent(event))
        )
      })
  }

  subscribeNotifications(
    options?: SubscribeNotificationsOptions
  ): Observable<Notification> {
    return new Observable<Notification>((subscriber) => {
      this.nostrClient.getLoggedInUser().match(
        (user) => {
          this.nostrClient
            .subscribeEvents({
              kinds: [
                NDKKind.Reaction,
                NDKKind.Text,
                NDKKind.Repost,
                NDKKind.Zap,
              ],
              '#p': [user.pubkey],
              since: options?.since
                ? Math.floor(options.since.getTime() / 1000)
                : undefined,
              until: options?.until
                ? Math.floor(options.until.getTime() / 1000)
                : undefined,
              limit: options?.limit ?? 20,
            })
            .subscribe({
              next: (event) => {
                if (event.author.pubkey === user.pubkey) {
                  // Exclude user's own posts
                  return
                }
                this.createNotificationFromEvent(event).match(
                  (notification) => subscriber.next(notification),
                  (error) =>
                    subscriber.error(
                      new AggregateError(
                        [error],
                        'Failed to create notification from event'
                      )
                    )
                )
              },
              error: (error) =>
                subscriber.error(
                  new AggregateError(
                    [error],
                    'Failed to subscribe notifications'
                  )
                ),
            })
        },
        (error) =>
          subscriber.error(
            new AggregateError([error], 'Failed to get logged in user')
          )
      )
    })
  }

  private createNotificationFromEvent(
    event: NDKEvent
  ): ResultAsync<Notification, Error> {
    return this.userProfileRepository
      .fetchProfile(event.author.npub)
      .andThen((actorProfile) => {
        const actor = {
          npub: event.author.npub,
          pubkey: event.pubkey,
          profile: actorProfile,
        }
        const targetEventId = event.tags.find((tag) => tag[0] === 'e')?.[1]

        if (!targetEventId) {
          return err(new Error('No target event found in notification'))
        }

        return this.nostrClient
          .fetchEvent(targetEventId)
          .andThen((targetEvent) =>
            this.noteService.createNoteFromEvent(targetEvent)
          )
          .andThen((targetNote) => {
            let type: NotificationReactionType
            let customReaction: string | undefined
            let zaps: number | undefined

            switch (event.kind) {
              case NDKKind.Reaction:
                if (event.content === '+') {
                  type = 'like'
                } else if (event.content === '-') {
                  type = 'dislike'
                } else {
                  type = 'custom-reaction'
                  customReaction = event.content
                }
                break
              case NDKKind.Text:
                type = 'reply'
                break
              case NDKKind.Repost:
                type = 'repost'
                break
              case NDKKind.Zap:
                type = 'zap'
                zaps = this.extractZapAmount(event)
                break
              default:
                return err(new Error(`Unknown event kind: ${event.kind}`))
            }

            return ResultAsync.fromPromise(
              Promise.resolve(
                new Notification({
                  id: event.id,
                  type,
                  actor,
                  target: targetNote,
                  createdAt: new Date(
                    event.created_at ? event.created_at * 1000 : 0
                  ),
                  zaps,
                  customReaction,
                })
              ),
              (error) => error as Error
            )
          })
      })
  }

  private extractZapAmount(zapEvent: NDKEvent): number {
    const bolt11Tag = zapEvent.tags.find((tag) => tag[0] === 'bolt11')
    if (!bolt11Tag || !bolt11Tag[1]) {
      return 0
    }

    try {
      const decodedInvoice = decode(bolt11Tag[1])
      const amountSection = decodedInvoice.sections.find(
        (section) => section.name === 'amount'
      )
      if (amountSection && amountSection.value) {
        return Math.floor(parseInt(amountSection.value as string, 10) / 1000)
      }
    } catch (error) {
      console.error('Failed to decode bolt11 invoice:', error)
    }

    return 0
  }
}
