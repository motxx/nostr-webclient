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
  postNote(note: Note): Observable<void>
  fetchPastNotes(options?: SubscribeNotesOptions): Observable<Note>
  subscribeNotes(options?: SubscribeNotesOptions): Observable<Note>
}
