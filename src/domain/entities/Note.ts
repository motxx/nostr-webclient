import emojiRegex from 'emoji-regex'
import { NoteReactions, NoteReactionsType } from './NoteReactions'
import { User } from './User'
import { NDKKind, NostrEvent } from '@nostr-dev-kit/ndk'
import { generateEventId } from '@/infrastructure/nostr/utils'

export type EmojiString = string
export type PostActionType = 'reply' | 'repost' | 'like' | 'zap' | EmojiString

export const isEmoji = (str: string): boolean => {
  return emojiRegex().test(str)
}

export type MediaType = 'image' | 'audio' | 'video' | 'youtube'

export type Media = {
  type: MediaType
  url: string
}

export interface NoteType {
  id: string
  author: User
  text: string
  media?: Media[]
  json: string
  created_at: Date

  replyTargetNotes?: NoteType[] // リプライ先のポスト
  receivedReplyNotes?: NoteType[] // 自分のノートにリプライしたノート
  reactions: NoteReactionsType
  relays: string[]

  following?: boolean // TODO: ユーザデータなので消す
}

export class Note implements NoteType {
  public readonly id: string = ''
  public readonly author: User = { npub: '', pubkey: '' }
  public readonly text: string = ''
  public readonly media?: Media[]
  public readonly json: string = ''
  public readonly created_at: Date = new Date('1970-01-01T00:00:00Z')
  public readonly relays: string[] = []

  public replyTargetNotes?: NoteType[]
  public receivedReplyNotes?: NoteType[]
  public readonly reactions: NoteReactions = {
    likesCount: 0,
    repostsCount: 0,
    zapsAmount: 0,
    customReactions: {},
  }

  public following: boolean = false // TODO: ユーザデータなので消す

  constructor(data: NoteType) {
    Object.assign(this, data)
  }

  static createNoteByUser(user: User, text: string): Note {
    const createdAt = new Date()
    const rawNostrEvent: NostrEvent = {
      pubkey: user.pubkey,
      created_at: createdAt.getTime(),
      kind: NDKKind.Text,
      content: text,
      tags: [],
    }
    const id = generateEventId(rawNostrEvent)
    return new Note({
      id,
      author: user,
      text,
      json: JSON.stringify({ ...rawNostrEvent, id }),
      created_at: createdAt,
      reactions: {
        likesCount: 0,
        repostsCount: 0,
        zapsAmount: 0,
        customReactions: {},
      },
      relays: [],
    })
  }

  toUnsignedNostrEvent(): NostrEvent {
    return {
      id: this.id,
      pubkey: this.author.pubkey,
      created_at: parseInt(
        Math.floor(this.created_at.getTime() / 1000).toString(),
        10
      ),
      kind: NDKKind.Text,
      tags:
        this.replyTargetNotes?.map((replyNote) => ['e', replyNote.id]) || [],
      content: this.text,
    }
  }

  createRepostNostrEvent(): NostrEvent {
    return {
      id: this.id,
      pubkey: this.author.pubkey,
      created_at: this.created_at.getTime(),
      kind: NDKKind.Repost,
      tags: [
        ['e', this.id, this.relays[0]],
        ['p', this.author.pubkey],
      ],
      content: this.json,
    }
  }

  createLikeNostrEvent(): NostrEvent {
    return {
      id: this.id,
      pubkey: this.author.pubkey,
      created_at: this.created_at.getTime(),
      kind: NDKKind.Reaction,
      tags: [
        ['e', this.id],
        ['p', this.author.pubkey],
      ],
      content: '+',
    }
  }
}
