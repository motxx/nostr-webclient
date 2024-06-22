import { useCallback, useEffect, useRef } from 'react'
import { NoteService } from '@/infrastructure/services/NoteService'
import { SubscribeNotes } from '@/domain/use_cases/SubscribeNotes'
import { Note } from '@/domain/entities/Note'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { useNostrClient } from '@/hooks/useNostrClient'

export const useSubscribeNotes = () => {
  const nostrClient = useNostrClient()
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  const subscribe = useCallback(
    async (onNote: (note: Note) => void, options?: SubscribeNotesOptions) => {
      if (!nostrClient) {
        return
      }
      const userProfileService = new UserProfileService(nostrClient)
      const noteService = new NoteService(nostrClient, userProfileService)
      const subscribeTimeline = new SubscribeNotes(noteService)
      const subscription = await subscribeTimeline.execute(onNote, options)
      subscriptionRef.current = subscription
      return subscription
    },
    [nostrClient]
  )

  useEffect(() => {
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
      }
    }
  }, [])

  return { subscribe }
}
