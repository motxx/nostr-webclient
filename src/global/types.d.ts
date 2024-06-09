export type NoteItemType = {
  userId: string
  userName: string
  verified: boolean
  content: string
  replies: number
  likes: number
  reposts: number
  zaps: number
  userImage: string
  timestamp: string
  mediaUrl?: string
  mediaType?: 'image' | 'video-file' | 'video-youtube'
  following: boolean // TODO: ユーザデータなので消す
}

export type NotificationNoteItemType = NoteItemType & {
  id: string
  type: 'like' | 'reply' | 'repost' | 'zap'
}

export interface UserType {
  npub: string
  pubkey: string
  nostrAddress?: string
  name: string
  bio?: string
  image?: string
  followersCount?: number
  followingCount?: number
  headerImage?: string
  links?: Record<string, string>
  settings?: UserSettingsType
}

export interface UserSettingsType {
  connectionUri?: string
  walletAuthUri?: string
  defaultZapAmount?: number
}

export type LoginStatus = boolean
