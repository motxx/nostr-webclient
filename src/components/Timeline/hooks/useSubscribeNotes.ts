import { useCallback } from 'react'
import { NoteService } from '@/infrastructure/services/NoteService'
import { SubscribeNotes } from '@/domain/use_cases/SubscribeNotes'
import { Note } from '@/domain/entities/Note'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { useNostrClient } from '@/hooks/useNostrClient'

export const useSubscribeNotes = () => {
  const nostrClient = useNostrClient()
  const subscribe = useCallback(
    async (onNote: (note: Note) => void, options?: SubscribeNotesOptions) => {
      if (!nostrClient) {
        return
      }
      const userProfileService = new UserProfileService(nostrClient)
      const noteService = new NoteService(nostrClient, userProfileService)
      const subscribeTimeline = new SubscribeNotes(noteService)
      await subscribeTimeline.execute(onNote, options)
    },
    [nostrClient]
  )

  return { subscribe }
}
