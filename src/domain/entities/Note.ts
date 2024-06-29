import { NoteReactions, NoteReactionsType } from './NoteReactions'
import { User } from './User'

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

  replyParentNote?: NoteType // リプライ先の元ポスト
  replyChildNotes?: NoteType[] // 自分のノートにリプライしたノート

  reactions: NoteReactionsType

  following?: boolean // TODO: ユーザデータなので消す
}

export type NotificationNoteType = NoteType & {
  type: 'like' | 'reply' | 'repost' | 'zap'
}

export class Note implements NoteType {
  public readonly id: string = ''
  public readonly author: User = { npub: '', pubkey: '' }
  public readonly text: string = ''
  public readonly media?: Media[]
  public readonly json: string = ''
  public readonly created_at: Date = new Date('1970-01-01T00:00:00Z')

  public replyParentNote?: NoteType
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
}
