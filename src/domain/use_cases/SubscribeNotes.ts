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
    const result = await this.noteRepository.subscribeNotes(onNote, options)
    if (result.isOk()) {
      return result.value
    } else {
      throw result.error
    }
  }
}
