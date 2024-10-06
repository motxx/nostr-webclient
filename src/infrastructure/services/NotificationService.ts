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
import { Observable, switchMap, throwError, map, filter, mergeMap } from 'rxjs'
import { joinErrors } from '@/utils/errors'

export class NotificationService implements NotificationRepository {
  constructor(
    private nostrClient: NostrClient,
    private userProfileRepository: UserProfileRepository,
    private noteService: NoteService
  ) {}

  fetchPastNotifications(
    options?: SubscribeNotificationsOptions
  ): Observable<Notification> {
    return this.nostrClient.getLoggedInUser().match(
      (user) => {
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
          .pipe(
            filter((event) => event.author.pubkey !== user.pubkey),
            mergeMap((event) => this.createNotificationFromEvent(event))
          )
      },
      (error) => {
        return throwError(() =>
          joinErrors(new Error('Failed to fetch past notifications'), error)
        )
      }
    )
  }

  subscribeNotifications(
    options?: SubscribeNotificationsOptions
  ): Observable<Notification> {
    return this.nostrClient.getLoggedInUser().match(
      (user) => {
        return this.nostrClient
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
          .pipe(
            filter(
              (event): event is NDKEvent =>
                event instanceof NDKEvent && event.author.pubkey !== user.pubkey
            ),
            mergeMap((event) => this.createNotificationFromEvent(event))
          )
      },
      (error) => {
        return throwError(() =>
          joinErrors(new Error('Failed to subscribe notifications'), error)
        )
      }
    )
  }

  private createNotificationFromEvent(
    event: NDKEvent
  ): Observable<Notification> {
    return this.userProfileRepository.fetchProfile(event.author.npub).pipe(
      switchMap((actorProfile) => {
        const actor = {
          npub: event.author.npub,
          pubkey: event.pubkey,
          profile: actorProfile,
        }
        const targetEventId = event.tags.find((tag) => tag[0] === 'e')?.[1]
        if (!targetEventId) {
          return throwError(
            () => new Error('No target event found in notification')
          )
        }

        return this.nostrClient.fetchEvent(targetEventId).pipe(
          switchMap((targetEvent) =>
            this.noteService.createNoteFromEvent(targetEvent)
          ),
          map((targetNote) => {
            const { type, customReaction, zaps } =
              this.getNotificationDetails(event)
            return new Notification({
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
          })
        )
      })
    )
  }

  private getNotificationDetails(event: NDKEvent): {
    type: NotificationReactionType
    customReaction?: string
    zaps?: number
  } {
    switch (event.kind) {
      case NDKKind.Reaction:
        if (event.content === '+') return { type: 'like' }
        if (event.content === '-') return { type: 'dislike' }
        return { type: 'custom-reaction', customReaction: event.content }
      case NDKKind.Text:
        return { type: 'reply' }
      case NDKKind.Repost:
        return { type: 'repost' }
      case NDKKind.Zap:
        return { type: 'zap', zaps: this.extractZapAmount(event) }
      default:
        throw new Error(`Unknown event kind: ${event.kind}`)
    }
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
