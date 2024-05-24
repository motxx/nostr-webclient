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
