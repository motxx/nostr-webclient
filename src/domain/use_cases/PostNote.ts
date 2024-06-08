import { Note } from '@/domain/entities/Note'
import { NoteRepository } from '@/domain/repositories/NoteRepository'

export class PostNote {
  constructor(private noteRepository: NoteRepository) {}

  async execute(note: Note) {
    this.noteRepository.postNote(note)
  }
}
