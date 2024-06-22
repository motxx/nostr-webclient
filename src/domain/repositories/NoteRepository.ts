import { Note } from '@/domain/entities/Note'

export type SubscribeNotesOptions = {
  since?: Date
  until?: Date
  limit?: number
  text?: boolean
  image?: boolean
  audio?: boolean
  video?: boolean
  youtube?: boolean
  authorPubkeys?: string[]
  isForever?: boolean
}

export interface NoteRepository {
  postNote(note: Note): Promise<void>

  subscribeNotes(
    onNote: (note: Note) => void,
    options?: SubscribeNotesOptions
  ): Promise<{ unsubscribe: () => void }>
}
