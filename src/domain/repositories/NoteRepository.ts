import { Note } from '@/domain/entities/Note'

export type SubscribeTimelineOptions = {
  since?: Date
  limit?: number
  text?: boolean
  image?: boolean
  audio?: boolean
  video?: boolean
}

export interface NoteRepository {
  postNote(note: Note): Promise<void>

  subscribeTimeline(
    onNote: (note: Note) => void,
    options?: SubscribeTimelineOptions
  ): Promise<void>
}
