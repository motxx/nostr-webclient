import { NostrClient } from '../nostr/nostrClient'
import { PublicChatRepository } from '@/domain/repositories/PublicChatRepository'
import { PublicChannel, PublicChatMessage } from '@/domain/entities/PublicChat'
import { NDKFilter, NDKKind, NostrEvent } from '@nostr-dev-kit/ndk'
import { User } from '@/domain/entities/User'
import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { map, Observable, of, switchMap, throwError } from 'rxjs'

// https://scrapbox.io/nostr/NIP-28
export class PublicChatService implements PublicChatRepository {
  constructor(
    private nostrClient: NostrClient,
    private userProfileRepository: UserProfileRepository
  ) {}

  fetchChannels(): Observable<PublicChannel> {
    return this.nostrClient
      .fetchEvents({
        kinds: [NDKKind.ChannelCreation],
      })
      .pipe(
        switchMap((event) =>
          of(
            new PublicChannel({
              id: event.id,
              name: JSON.parse(event.content).name || 'Unnamed Channel',
              description: JSON.parse(event.content).about,
              picture: JSON.parse(event.content).picture,
              created_at: new Date((event.created_at || 0) * 1000),
              updated_at: new Date((event.created_at || 0) * 1000),
            })
          )
        )
      )
  }

  fetchChannelMessages(channelId: string): Observable<PublicChatMessage> {
    return this.nostrClient
      .fetchEvents({
        kinds: [NDKKind.ChannelMessage],
        '#e': [channelId],
      })
      .pipe(
        switchMap((event) =>
          this.userProfileRepository.fetchProfile(event.author.npub).pipe(
            map(
              (profile) =>
                new PublicChatMessage({
                  id: event.id,
                  channel_id: channelId,
                  author: new User({
                    npub: event.author.npub,
                    pubkey: event.pubkey,
                    profile,
                  }),
                  content: event.content,
                  created_at: new Date((event.created_at || 0) * 1000),
                })
            )
          )
        )
      )
  }

  postChannelMessage(channelId: string, content: string): Observable<void> {
    const loggedInUserResult = this.nostrClient.getLoggedInUser()
    if (loggedInUserResult.isErr()) {
      return throwError(() => new Error('No logged in user'))
    }
    const loggedInUser = loggedInUserResult.value

    const event: NostrEvent = {
      kind: NDKKind.ChannelMessage,
      content: content,
      tags: [['e', channelId]],
      created_at: Math.floor(Date.now() / 1000),
      pubkey: loggedInUser.pubkey,
    }
    return this.nostrClient.postEvent(event)
  }

  subscribeToChannelMessages(
    channelId: string,
    options?: {
      limit?: number
      until?: Date
      isForever?: boolean
    }
  ): Observable<PublicChatMessage> {
    const filter: NDKFilter = {
      kinds: [NDKKind.ChannelMessage],
      '#e': [channelId],
    }

    if (options?.until) {
      filter.until = Math.floor(options.until.getTime() / 1000)
    }

    if (options?.limit) {
      filter.limit = options.limit
    }

    return this.nostrClient.subscribeEvents(filter).pipe(
      switchMap((event) =>
        this.userProfileRepository.fetchProfile(event.author.npub).pipe(
          map(
            (profile) =>
              new PublicChatMessage({
                id: event.id,
                channel_id: channelId,
                author: new User({
                  npub: event.pubkey,
                  pubkey: event.pubkey,
                  profile,
                }),
                content: event.content,
                created_at: new Date((event.created_at || 0) * 1000),
              })
          )
        )
      )
    )
  }
}
