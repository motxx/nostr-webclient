import { User } from './User'

export type MediaType = 'image' | 'audio' | 'video' | 'youtube'

export interface NoteType {
  id: string
  author: User
  text: string
  created_at: Date

  imageUrl?: string
  audioUrl?: string
  videoUrl?: string
  youtubeUrl?: string
  mediaTypes?: Set<MediaType>

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
  created_at: Date = new Date('1970-01-01T00:00:00Z')

  imageUrl?: string
  audioUrl?: string
  videoUrl?: string
  youtubeUrl?: string
  mediaTypes?: Set<MediaType>

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
