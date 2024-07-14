import { User } from '@/domain/entities/User'
import { Note } from '@/domain/entities/Note'
import { NoteReactions } from '@/domain/entities/NoteReactions'

export type NotificationReactionType =
  | 'like'
  | 'dislike'
  | 'reply'
  | 'repost'
  | 'zap'
  | 'custom-reaction'

export interface NotificationType {
  id: string
  type: NotificationReactionType
  customReaction?: string
  actor: User
  target: Note
  createdAt: Date
  zaps?: number
}

export class Notification implements NotificationType {
  id: string = ''
  type: NotificationReactionType = 'like'
  customReaction?: string
  actor: User = new User({ pubkey: '', npub: '' })
  target: Note = new Note({
    id: '',
    author: {
      pubkey: '',
      npub: '',
    },
    text: '',
    json: '',
    created_at: new Date(),
    reactions: new NoteReactions({
      likesCount: 0,
      repostsCount: 0,
      zapsAmount: 0,
      customReactions: {},
    }),
    relays: [],
  })
  createdAt: Date = new Date()
  zaps?: number

  constructor(data: NotificationType) {
    Object.assign(this, data)
  }
}
