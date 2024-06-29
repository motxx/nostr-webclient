import { NoteReactionsType } from './NoteReactions'
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

  replyParentNote?: NoteType
  replyChildNotes?: NoteType[]

  reactions: NoteReactionsType

  following?: boolean // TODO: ユーザデータなので消す
}

export type NotificationNoteType = NoteType & {
  type: 'like' | 'reply' | 'repost' | 'zap'
}

export class Note implements NoteType {
  id: string = ''
  author: User = { npub: '', pubkey: '' }
  text: string = ''
  media?: Media[]
  json: string = ''
  created_at: Date = new Date('1970-01-01T00:00:00Z')

  replyParentNote?: NoteType
  reactions: NoteReactionsType = {
    likesCount: 0,
    repostsCount: 0,
    zapsAmount: 0,
  }

  following: boolean = false // TODO: ユーザデータなので消す

  constructor(data: NoteType) {
    Object.assign(this, data)
  }
}
