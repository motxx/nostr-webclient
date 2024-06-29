import { ResultAsync, ok, err } from 'neverthrow'
import { NDKEvent, NDKFilter, NDKKind } from '@nostr-dev-kit/ndk'
import { Media, Note } from '@/domain/entities/Note'
import {
  NoteRepository,
  SubscribeNotesOptions,
} from '@/domain/repositories/NoteRepository'
import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { User } from '@/domain/entities/User'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { unixtimeOf } from '../nostr/utils'
import { NoteReactions } from '@/domain/entities/NoteReactions'

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi']

export class NoteService implements NoteRepository {
  #nostrClient: NostrClient
  #userProfileRepository: UserProfileRepository

  constructor(
    nostrClient: NostrClient,
    userProfileRepository: UserProfileRepository
  ) {
    this.#nostrClient = nostrClient
    this.#userProfileRepository = userProfileRepository
  }

  postNote(note: Note): ResultAsync<void, Error> {
    return ResultAsync.fromSafePromise(
      Promise.reject(new Error('Method not implemented.'))
    )
  }

  subscribeNotes(
    onNote: (note: Note) => void,
    options?: SubscribeNotesOptions
  ): ResultAsync<{ unsubscribe: () => void }, Error> {
    return this.#nostrClient
      .getLoggedInUser()
      .asyncAndThen((user) =>
        ResultAsync.fromSafePromise(
          user
            .follows()
            .then((follows) => ok(follows))
            .catch((error) =>
              err(new Error(`Failed to get user follows: ${error}`))
            )
        )
      )
      .andThen((followsResult) => {
        const authors =
          options?.authorPubkeys ??
          (followsResult.isOk()
            ? Array.from(followsResult.value).map((a) => a.pubkey)
            : [])

        const filterOptions: NDKFilter = {
          kinds: [NDKKind.Text],
          authors,
          since: options?.since ? unixtimeOf(options.since) : undefined,
          until: options?.until ? unixtimeOf(options.until) : undefined,
          limit: options?.limit ?? 20,
          search: options?.image
            ? `http.+(${imageExtensions.join('|')})`
            : undefined,
        }

        return ok(filterOptions)
      })
      .andThen((filterOptions) =>
        ResultAsync.fromPromise(
          this.#nostrClient.subscribeEvents(
            filterOptions,
            async (event: NDKEvent) => {
              const noteResult = await this.createNoteFromEvent(event)
              if (noteResult.isOk()) {
                onNote(noteResult.value)
              }
            },
            options?.isForever
          ),
          (error) => new Error(`Failed to subscribe to events: ${error}`)
        )
      )
      .map((result) => {
        if (result.isOk()) {
          return result.value
        } else {
          throw result.error
        }
      })
  }

  subscribeZaps(
    onZapEvent: (event: NDKEvent) => void
  ): ResultAsync<void, Error> {
    return ResultAsync.fromSafePromise(
      Promise.reject(new Error('Method not implemented.'))
    )
  }

  private getUrlExtension(url: string): string | undefined {
    const pathname = new URL(url).pathname
    const parts = pathname.split('.')
    return parts.length > 1 ? parts.pop()?.toLowerCase() : undefined
  }

  private isImageUrl(url: string): boolean {
    const extension = this.getUrlExtension(url)
    return extension ? imageExtensions.includes(extension) : false
  }

  private isVideoUrl(url: string): boolean {
    const extension = this.getUrlExtension(url)
    return extension ? videoExtensions.includes(extension) : false
  }

  private isYouTubeUrl(url: string): boolean {
    return /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?[\w-]+/.test(
      url
    )
  }

  private extractMedia(event: NDKEvent): ResultAsync<Media[], Error> {
    return ResultAsync.fromPromise(
      (async () => {
        const content = event.content
        const urlPattern = /(https?:\/\/[^\s]+)/g
        const matches = content.match(urlPattern) || []

        const media: Media[] = []

        for (const url of matches) {
          if (this.isImageUrl(url)) {
            media.push({ type: 'image', url })
          } else if (this.isVideoUrl(url)) {
            media.push({ type: 'video', url })
          } else if (this.isYouTubeUrl(url)) {
            media.push({ type: 'youtube', url })
          }
        }

        return media
      })(),
      (error) => new Error(`Failed to extract media: ${error}`)
    )
  }

  private createNoteFromEvent(
    event: NDKEvent,
    depth: number = 0
  ): ResultAsync<Note, Error> {
    return ResultAsync.fromPromise(
      this.#userProfileRepository.fetchProfile(event.author.npub),
      (error) => new Error(`Failed to fetch user profile: ${error}`)
    )
      .andThen((profileResult) => {
        if (profileResult.isErr()) {
          return err(profileResult.error)
        }
        const profile = profileResult.value
        return ok(
          new User({
            npub: event.author.npub,
            pubkey: event.author.pubkey,
            profile,
          })
        )
      })
      .andThen((author) =>
        this.extractMedia(event).map((media) => ({ author, media }))
      )
      .andThen(({ author, media }) => {
        const replyEventId = event.tags.find((tag) => tag[0] === 'e')?.[1]

        const fetchReplyParentNote =
          depth === 0 && replyEventId
            ? this.#nostrClient
                .fetchEvent(replyEventId)
                .andThen((replyEvent) =>
                  this.createNoteFromEvent(replyEvent, 1)
                )
            : ResultAsync.fromPromise(
                Promise.resolve(undefined as Note | undefined),
                () => new Error('Failed to resolve undefined')
              )

        return ResultAsync.combine([
          fetchReplyParentNote,
          this.createNoteReactionsFromEvent(event),
        ]).map(
          ([replyParentNote, reactions]) =>
            new Note({
              id: event.id,
              author,
              text: event.content,
              media,
              json: JSON.stringify(event.rawEvent()),
              replyParentNote,
              replyChildNotes: [],
              reactions,
              created_at: event.created_at
                ? new Date(event.created_at * 1000)
                : new Date('1970-01-01T00:00:00Z'),
            })
        )
      })
  }
  private createNoteReactionsFromEvent(
    event: NDKEvent
  ): ResultAsync<NoteReactions, Error> {
    const likeFilter: NDKFilter = {
      kinds: [NDKKind.Reaction],
      '#e': [event.id],
    }

    return ResultAsync.combine([
      this.#nostrClient.fetchEvents(likeFilter),
      this.#nostrClient.fetchEvents({
        kinds: [NDKKind.Repost],
        '#e': [event.id],
      }),
      this.#nostrClient.calculateZapsAmount(event.id),
    ]).map(([reactionEvents, repostEvents, zapsAmount]) => {
      let likesCount = 0
      const customReactions: { [key: string]: number } = {}

      for (const reactionEvent of reactionEvents) {
        const content = reactionEvent.content.trim()

        if (content === '+' || content === '') {
          likesCount++
        } else if (
          (content.startsWith(':') && content.endsWith(':')) ||
          (content.length === 1 && content.match(/\p{Emoji}/u))
        ) {
          customReactions[content] = (customReactions[content] || 0) + 1
        }
      }

      return new NoteReactions({
        likesCount,
        repostsCount: repostEvents.length,
        zapsAmount,
        customReactions,
      })
    })
  }
}
