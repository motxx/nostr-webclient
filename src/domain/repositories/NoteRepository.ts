import { ResultAsync } from 'neverthrow'
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
  postNote(note: Note): ResultAsync<void, Error>

  subscribeNotes(
    onNote: (note: Note) => void,
    options?: SubscribeNotesOptions
  ): ResultAsync<{ unsubscribe: () => void }, Error>
}
