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

  // TODO: NoteReactions
  replies: number
  likes: number
  reposts: number
  zaps: number

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

  // TODO: NoteReactions
  replies: number = 0
  likes: number = 0
  reposts: number = 0
  zaps: number = 0

  following: boolean = false // TODO: ユーザデータなので消す

  constructor(data: NoteType) {
    Object.assign(this, data)
  }
}
