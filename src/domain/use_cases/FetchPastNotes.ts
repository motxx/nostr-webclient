import {
  NoteRepository,
  SubscribeNotesOptions,
} from '../repositories/NoteRepository'
import { Note } from '../entities/Note'
import { Observable } from 'rxjs'

export class FetchPastNotes {
  constructor(private noteRepository: NoteRepository) {}

  execute(options: SubscribeNotesOptions): Observable<Note> {
    return this.noteRepository.fetchPastNotes(options)
  }
}
