export type PostItemType = {
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

export interface UserType {
  npub: string
  pubkey: string
  name: string
  image?: string
  settings?: UserSettingsType
}

export interface UserSettingsType {
  connectionUri?: string
  walletAuthUri?: string
  defaultZapAmount?: number
}

export type LoginStatus = boolean
