import { useCallback, useEffect, useRef } from 'react'
import { NoteService } from '@/infrastructure/services/NoteService'
import { SubscribeNotes } from '@/domain/use_cases/SubscribeNotes'
import { Note } from '@/domain/entities/Note'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { useNostrClient } from '@/hooks/useNostrClient'

export const useSubscribeNotes = () => {
  const nostrClient = useNostrClient()
  const subscriptionsRef = useRef<Array<{ unsubscribe: () => void }>>([])

  const subscribe = useCallback(
    async (onNote: (note: Note) => void, options?: SubscribeNotesOptions) => {
      if (!nostrClient) {
        return
      }
      const userProfileService = new UserProfileService(nostrClient)
      const noteService = new NoteService(nostrClient, userProfileService)
      const subscribeTimeline = new SubscribeNotes(noteService)

      const subscription = await subscribeTimeline.execute(onNote, options)
      subscriptionsRef.current.push(subscription)
      return subscription
    },
    [nostrClient]
  )

  const unsubscribe = useCallback(
    (subscription: { unsubscribe: () => void }) => {
      const index = subscriptionsRef.current.indexOf(subscription)
      if (index > -1) {
        subscription.unsubscribe()
        subscriptionsRef.current.splice(index, 1)
      }
    },
    []
  )

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach((subscription) =>
      subscription.unsubscribe()
    )
    subscriptionsRef.current = []
  }, [])

  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [unsubscribeAll])

  return { subscribe, unsubscribe, unsubscribeAll }
}
