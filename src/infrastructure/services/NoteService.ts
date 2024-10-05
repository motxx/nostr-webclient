import { Result, ResultAsync, ok } from 'neverthrow'
import { NDKEvent, NDKKind } from '@nostr-dev-kit/ndk'
import { isEmoji, Media, Note } from '@/domain/entities/Note'
import {
  NoteRepository,
  SubscribeNotesOptions,
} from '@/domain/repositories/NoteRepository'
import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { User } from '@/domain/entities/User'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { unixtimeOf } from '../nostr/utils'
import { NoteReactions } from '@/domain/entities/NoteReactions'
import { bech32ToHex } from '@/utils/addressConverter'
import { Observable } from 'rxjs'
import { joinErrors } from '@/utils/errors'

const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
const videoExtensions = ['mp4', 'webm', 'ogg', 'mov', 'avi']

const noteIdPattern = '(?:nostr:)?(note1[a-zA-Z0-9]{58})'
const eventIdPattern = '(?:nostr:)?(event1[a-zA-Z0-9]{58})'
const youtubePattern =
  '(?:https?://)?(?:www.)?(?:youtube.com|youtu.be)/(?:watch?v=)?[w-]+'

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
    return this.#nostrClient.postEvent(note.toUnsignedNostrEvent())
  }

  fetchPastNotes(options?: SubscribeNotesOptions): ResultAsync<Note[], Error> {
    return this.#nostrClient
      .fetchEvents({
        kinds: [NDKKind.Text],
        authors: options?.authorPubkeys,
        since: options?.since && unixtimeOf(options.since),
        until: options?.until && unixtimeOf(options.until),
        search: options?.image
          ? `http.+(${imageExtensions.join('|')})`
          : undefined,
        '#t': options?.hashtag ? [options.hashtag] : undefined,
      })
      .andThen((events) =>
        ResultAsync.combine(
          events.map((event) => this.createNoteFromEvent(event))
        )
      )
  }

  subscribeNotes(options?: SubscribeNotesOptions): Observable<Note> {
    return new Observable<Note>((subscriber) => {
      this.#nostrClient
        .subscribeEvents({
          kinds: [NDKKind.Text],
          authors: options?.authorPubkeys,
          since: options?.since ? unixtimeOf(options.since) : undefined,
          until: options?.until ? unixtimeOf(options.until) : undefined,
          limit: options?.limit ?? 20,
          search: options?.image
            ? `http.+(${imageExtensions.join('|')})`
            : undefined,
          '#t': options?.hashtag ? [options.hashtag] : undefined,
        })
        .subscribe({
          next: (event) =>
            this.createNoteFromEvent(event).match(
              (note) => subscriber.next(note),
              (error) =>
                subscriber.error(
                  joinErrors(
                    new Error('Failed to create note from event'),
                    error
                  )
                )
            ),
          error: (error) =>
            subscriber.error(
              joinErrors(new Error('Failed to subscribe notes'), error)
            ),
        })
    })
  }

  subscribeZaps(
    onZapEvent: (event: NDKEvent) => void
  ): ResultAsync<void, Error> {
    return ResultAsync.fromSafePromise(
      Promise.reject(new Error('Method not implemented.'))
    )
  }

  private getUrlExtension = (url: string): string | undefined =>
    new URL(url).pathname.split('.').pop()?.toLowerCase()

  private isUrlOfType = (url: string, extensions: string[]): boolean =>
    extensions.includes(this.getUrlExtension(url) ?? '')

  private isImageUrl = (url: string): boolean =>
    this.isUrlOfType(url, imageExtensions)

  private isVideoUrl = (url: string): boolean =>
    this.isUrlOfType(url, videoExtensions)

  private isYouTubeUrl = (url: string): boolean =>
    new RegExp(youtubePattern).test(url)

  private extractMedia(event: NDKEvent): Result<Media[], Error> {
    return Result.fromThrowable(
      () => {
        const urlPattern = /(https?:\/\/[^\s]+)/g
        const matches = event.content.match(urlPattern) || []
        return matches.reduce<Media[]>((media: Media[], url: string) => {
          if (this.isImageUrl(url)) media.push({ type: 'image', url })
          else if (this.isVideoUrl(url)) media.push({ type: 'video', url })
          else if (this.isYouTubeUrl(url)) media.push({ type: 'youtube', url })
          return media
        }, [])
      },
      (e) => joinErrors(new Error('Failed to extract media from event'), e)
    )()
  }

  createNoteFromEvent(
    event: NDKEvent,
    depth: number = 0
  ): ResultAsync<Note, Error> {
    if (event.kind !== NDKKind.Text) {
      return ResultAsync.fromPromise(
        this.#userProfileRepository
          .fetchProfile(event.author.npub)
          .then((profile) => {
            const user = new User({
              npub: event.author.npub,
              pubkey: event.author.pubkey,
              profile: profile.isOk() ? profile.value : undefined,
            })

            return new Note({
              id: event.id,
              author: user,
              text: this.getTextContentForNonTextEvent(event),
              json: JSON.stringify(event.rawEvent()),
              relays: [],
              created_at: new Date(
                event.created_at ? event.created_at * 1000 : 0
              ),
              reactions: new NoteReactions({
                likesCount: 0,
                repostsCount: 0,
                zapsAmount: 0,
                customReactions: {},
              }),
            })
          }),
        (error) =>
          joinErrors(
            new Error('Failed to create note from non-text event'),
            error
          )
      )
    }

    return this.#userProfileRepository
      .fetchProfile(event.author.npub)
      .andThen((userProfile) => {
        return ok(
          new User({
            npub: event.author.npub,
            pubkey: event.author.pubkey,
            profile: userProfile || undefined,
          })
        )
      })
      .orElse((e) => {
        console.error(e)
        return ok(
          new User({
            npub: event.author.npub,
            pubkey: event.author.pubkey,
            profile: {},
          })
        )
      })
      .andThen((user) =>
        this.extractMedia(event)
          .map((media) => ({ author: user, media }))
          .orElse((e) => {
            console.error({ error: e, event })
            return ok({ author: user, media: [] })
          })
      )
      .andThen(({ author, media }) => {
        const replyEventId = event.tags.find((tag) => tag[0] === 'e')?.[1]

        const fetchReplyParentNote = (
          depth: number,
          replyEventId: string | undefined
        ): ResultAsync<Note | undefined, never> => {
          if (depth === 0 && replyEventId) {
            return this.#nostrClient
              .fetchEvent(replyEventId)
              .andThen((event: NDKEvent) => {
                if (event.kind !== NDKKind.Text) {
                  console.error('Fetched event is not a text event:', event)
                  return ok(undefined)
                }
                return this.createNoteFromEvent(event, 1)
              })
              .orElse((error) => {
                console.error('Error in fetchReplyParentNote:', error)
                return ok(undefined)
              })
          }
          return ResultAsync.fromSafePromise(Promise.resolve(undefined))
        }

        const mentionedEventIds = [
          ...(depth === 0
            ? Array.from(event.content.matchAll(new RegExp(noteIdPattern, 'g')))
                .map((match) => bech32ToHex(match[1]))
                .filter((eventId) => eventId.isOk())
                .filter((eventId) => eventId.value !== replyEventId)
            : []),
          ...(event.content
            .match(new RegExp(eventIdPattern, 'g'))
            ?.map((match) => bech32ToHex(match)) || []),
        ]

        const fetchMentionedNotes = ResultAsync.combine(
          mentionedEventIds
            .filter((eventId) => eventId.isOk())
            .map((eventId) => this.#nostrClient.fetchEvent(eventId.value))
            .map((eventResult) =>
              eventResult.andThen((event) => this.createNoteFromEvent(event, 1))
            )
            .filter(async (noteResult) => (await noteResult).isOk())
        )

        return ResultAsync.combine([
          fetchReplyParentNote(depth, replyEventId),
          fetchMentionedNotes,
          this.createNoteReactionsFromEvent(event),
        ]).map(([replyParentNote, mentionedNotes, reactions]) => {
          const text = this.cleanupText(event.content)
          return new Note({
            id: event.id,
            author,
            text,
            media,
            json: JSON.stringify(event.rawEvent()),
            replyTargetNotes: [
              ...(replyParentNote ? [replyParentNote] : []),
              ...mentionedNotes,
            ],
            reactions,
            relays: [],
            created_at: new Date(
              event.created_at ? event.created_at * 1000 : 0
            ),
          })
        })
      })
  }

  private getTextContentForNonTextEvent(event: NDKEvent): string {
    switch (event.kind) {
      case NDKKind.Reaction:
        return event.content
      case NDKKind.Repost:
        return ''
      case NDKKind.Zap:
        return ''
      default:
        return `kind: ${event.kind} のイベントです`
    }
  }

  private cleanupText(text: string): string {
    // 展開されるURLのみの行は消す
    return text
      .replaceAll(new RegExp(`^${noteIdPattern}$`, 'gm'), '')
      .replaceAll(
        new RegExp(
          `^\\s*https?://.+(${imageExtensions.join('|')})(?:\\?[^#]*)?(?:#.*)?\\s*$`,
          'gm'
        ),
        ''
      )
      .replaceAll(
        new RegExp(
          `^\\s*https?://.+(${videoExtensions.join('|')})(?:\\?[^#]*)?(?:#.*)?\\s*$`,
          'gm'
        ),
        ''
      )
      .replaceAll(new RegExp(`^\\s*${youtubePattern}\\s*$`, 'gm'), '')
  }

  private createNoteReactionsFromEvent(
    event: NDKEvent
  ): ResultAsync<NoteReactions, Error> {
    return ResultAsync.combine([
      this.#nostrClient.fetchEvents({
        kinds: [NDKKind.Reaction],
        '#e': [event.id],
      }),
      this.#nostrClient.fetchEvents({
        kinds: [NDKKind.Repost],
        '#e': [event.id],
      }),
      this.#nostrClient.calculateZapsAmount(event.id),
    ]).map(([reactionEvents, repostEvents, zapsAmount]) => {
      const reactions = reactionEvents.reduce(
        (acc, e) => {
          const content = e.content.trim()
          if (content === '+' || content === '') acc.likesCount++
          else if (isEmoji(content))
            acc.customReactions[content] =
              (acc.customReactions[content] || 0) + 1
          return acc
        },
        { likesCount: 0, customReactions: {} as Record<string, number> }
      )

      return new NoteReactions({
        ...reactions,
        repostsCount: repostEvents.length,
        zapsAmount,
      })
    })
  }
}
