import { NDKEvent, NDKFilter, NDKKind } from '@nostr-dev-kit/ndk'
import { MediaType, Note } from '@/domain/entities/Note'
import {
  NoteRepository,
  SubscribeNotesOptions,
} from '@/domain/repositories/NoteRepository'
import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { User } from '@/domain/entities/User'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { unixtimeOf } from '../nostr/utils'

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

  async postNote(note: Note): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async subscribeNotes(
    onNote: (note: Note) => void,
    options?: SubscribeNotesOptions
  ): Promise<void> {
    const user = await this.#nostrClient.getLoggedInUser()
    const follows = await user.follows()
    const authors =
      options?.authorPubkeys ??
      Array.from(follows.values()).map((a) => a.pubkey)

    const filterOptions: NDKFilter = {
      kinds: [NDKKind.Text],
      authors,
      since: options?.since ? unixtimeOf(options.since) : undefined,
      limit: options?.limit ?? 20,
      // NIP-50: Search Capability - https://scrapbox.io/nostr/NIP-50
      // search文字列の仕様はRelayer依存
      search: 'https?.+\\.(png|jpg)',
    }

    await this.#nostrClient.subscribeEvents(
      filterOptions,
      async (event: NDKEvent) => {
        if (this.isFilteredOut(event.content, options)) return

        const mediaTypes = this.getMediaTypes(event.content)
        const profile = await this.#userProfileRepository.fetchProfile(
          event.author.npub
        )
        const author = new User({
          npub: event.author.npub,
          pubkey: event.author.pubkey,
          profile,
        })

        const note = this.createNoteFromEvent(event, author, mediaTypes)
        onNote(note)
      }
    )
  }

  async subscribeZaps(onZapEvent: (event: NDKEvent) => void): Promise<void> {
    throw new Error('Method not implemented.')
  }

  private isFilteredOut(
    content: string,
    options?: SubscribeNotesOptions
  ): boolean {
    const imageUrls = content.match(/(https?.+\.(png|jpg))/)
    const audioUrls = content.match(/(https?.+\.mp3)/)
    const videoUrls = content.match(/(https?.+\.mp4)/)
    const youtubeUrls = content.match(/https?:\/\/www.youtube.com\//)

    if (options?.audio && !audioUrls) return true
    if (options?.image && !imageUrls) return true
    if (options?.video && !videoUrls) return true
    if (options?.youtube && !youtubeUrls) return true

    return false
  }

  private getMediaTypes(content: string): Set<MediaType> | undefined {
    const mediaTypes = new Set<MediaType>()

    if (content.match(/(https?.+\.(png|jpg))/)) mediaTypes.add('image')
    if (content.match(/(https?.+\.mp3)/)) mediaTypes.add('audio')
    if (content.match(/(https?.+\.mp4)/)) mediaTypes.add('video')
    if (content.match(/https?:\/\/www.youtube.com\//)) mediaTypes.add('youtube')

    return mediaTypes.size > 0 ? mediaTypes : undefined
  }

  private createNoteFromEvent(
    event: NDKEvent,
    author: User,
    mediaTypes: Set<MediaType> | undefined
  ): Note {
    const imageUrl = event.content.match(/(https?.+\.(png|jpg))/)?.[0]
    const audioUrl = event.content.match(/(https?.+\.mp3)/)?.[0]
    const videoUrl = event.content.match(/(https?.+\.mp4)/)?.[0]
    const youtubeUrl = event.content.match(/https?:\/\/www.youtube.com\//)?.[0]

    return new Note({
      id: event.id,
      author,
      text: event.content,
      mediaTypes,
      imageUrl,
      videoUrl,
      audioUrl,
      youtubeUrl,
      replies: 0,
      likes: 0,
      reposts: 0,
      zaps: 0,
      created_at: event.created_at
        ? new Date(event.created_at * 1000)
        : new Date('1970-01-01T00:00:00Z'),
    })
  }
}
