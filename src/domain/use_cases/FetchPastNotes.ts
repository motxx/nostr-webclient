import { ResultAsync } from 'neverthrow'
import {
  NoteRepository,
  SubscribeNotesOptions,
} from '../repositories/NoteRepository'
import { Note } from '../entities/Note'

export class FetchPastNotes {
  constructor(private noteRepository: NoteRepository) {}

  execute(options: SubscribeNotesOptions): ResultAsync<Note[], Error> {
    return this.noteRepository.fetchPastNotes(options)
  }
}
