import { Note } from '@/domain/entities/Note'
import {
  NoteRepository,
  SubscribeTimelineOptions,
} from '@/domain/repositories/NoteRepository'

export class SubscribeTimeline {
  constructor(private noteRepository: NoteRepository) {}

  async execute(
    onNote: (note: Note) => void,
    options?: SubscribeTimelineOptions
  ) {
    this.noteRepository.subscribeTimeline(onNote, options)
  }
}
