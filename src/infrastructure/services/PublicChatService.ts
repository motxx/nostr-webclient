import { Result, ResultAsync } from 'neverthrow'
import { NostrClient } from '../nostr/nostrClient'
import { PublicChatRepository } from '@/domain/repositories/PublicChatRepository'
import { PublicChannel, PublicChatMessage } from '@/domain/entities/PublicChat'
import { NDKFilter, NDKKind, NostrEvent } from '@nostr-dev-kit/ndk'
import { User } from '@/domain/entities/User'
import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'

// https://scrapbox.io/nostr/NIP-28
export class PublicChatService implements PublicChatRepository {
  constructor(
    private nostrClient: NostrClient,
    private userProfileRepository: UserProfileRepository
  ) {}

  fetchChannels(): ResultAsync<PublicChannel[], Error> {
    return this.nostrClient
      .fetchEvents({
        kinds: [NDKKind.ChannelCreation],
      })
      .map((events) =>
        events.map(
          (event) =>
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
  }

  fetchChannelMessages(
    channelId: string
  ): ResultAsync<PublicChatMessage[], Error> {
    return this.nostrClient
      .fetchEvents({
        kinds: [NDKKind.ChannelMessage],
        '#e': [channelId],
      })
      .andThen((events) =>
        ResultAsync.combine(
          events.map((event) =>
            this.userProfileRepository.fetchProfile(event.author.npub).map(
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

  postChannelMessage(
    channelId: string,
    content: string
  ): ResultAsync<void, Error> {
    const loggedInUserResult = this.nostrClient.getLoggedInUser()
    if (loggedInUserResult.isErr()) {
      return ResultAsync.fromSafePromise(
        Promise.reject(new Error('No logged in user'))
      )
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
    onMessage: (message: PublicChatMessage) => void,
    options?: {
      limit?: number
      until?: Date
      isForever?: boolean
    }
  ): Result<{ unsubscribe: () => void }, Error> {
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

    return this.nostrClient.subscribeEvents(
      filter,
      (event) => {
        this.userProfileRepository
          .fetchProfile(event.author.npub)
          .map((profile) => {
            return onMessage(
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
          })
        return ResultAsync.fromSafePromise(Promise.resolve())
      },
      options?.isForever
    )
  }
}
