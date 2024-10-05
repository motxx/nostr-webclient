import {
  NoteRepository,
  SubscribeNotesOptions,
} from '@/domain/repositories/NoteRepository'
import { Observable } from 'rxjs'
import { Note } from '../entities/Note'

export class SubscribeNotes {
  constructor(private noteRepository: NoteRepository) {}

  execute(options?: SubscribeNotesOptions): Observable<Note> {
    return this.noteRepository.subscribeNotes(options)
  }
}
