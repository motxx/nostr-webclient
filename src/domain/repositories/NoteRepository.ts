import { Result, ResultAsync } from 'neverthrow'
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
  hashtag?: string
  authorPubkeys?: string[]
}

export interface NoteRepository {
  fetchPastNotes(options?: SubscribeNotesOptions): ResultAsync<Note[], Error>
  postNote(note: Note): ResultAsync<void, Error>

  subscribeNotes(
    onNote: (note: Note) => void,
    options?: SubscribeNotesOptions
  ): Result<{ unsubscribe: () => void }, Error>
}
