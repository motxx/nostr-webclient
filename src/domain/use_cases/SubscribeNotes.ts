import { Note } from '@/domain/entities/Note'
import {
  NoteRepository,
  SubscribeNotesOptions,
} from '@/domain/repositories/NoteRepository'

export class SubscribeNotes {
  constructor(private noteRepository: NoteRepository) {}

  async execute(
    onNote: (note: Note) => void,
    options?: SubscribeNotesOptions
  ): Promise<{ unsubscribe: () => void }> {
    return this.noteRepository.subscribeNotes(onNote, options)
  }
}
