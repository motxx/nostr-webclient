import { ResultAsync } from 'neverthrow'
import { Note } from '@/domain/entities/Note'
import { Observable } from 'rxjs'

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
  postNote(note: Note): ResultAsync<void, Error>
  fetchPastNotes(options?: SubscribeNotesOptions): ResultAsync<Note[], Error>
  subscribeNotes(options?: SubscribeNotesOptions): Observable<Note>
}
