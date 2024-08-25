import { useCallback, useEffect } from 'react'
import { NoteService } from '@/infrastructure/services/NoteService'
import { SubscribeNotes } from '@/domain/use_cases/SubscribeNotes'
import { Note } from '@/domain/entities/Note'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { useNostrClient } from '@/hooks/useNostrClient'

const subscriptions: Array<{
  isForever?: boolean
  unsubscribe: () => void
}> = []

export const useSubscribeNotes = () => {
  const { nostrClient } = useNostrClient()

  const subscribe = useCallback(
    async (onNote: (note: Note) => void, options?: SubscribeNotesOptions) => {
      if (!nostrClient) {
        return
      }
      const userProfileService = new UserProfileService(nostrClient)
      const noteService = new NoteService(nostrClient, userProfileService)
      const subscribeTimeline = new SubscribeNotes(noteService)

      const subscription = await subscribeTimeline.execute(onNote, options)
      subscriptions.push({
        isForever: options?.isForever,
        unsubscribe: subscription.unsubscribe,
      })
      return subscription
    },
    [nostrClient]
  )

  const unsubscribe = useCallback(
    (subscription: { unsubscribe: () => void }) => {
      const index = subscriptions.findIndex(
        (s) => s.unsubscribe === subscription.unsubscribe
      )
      if (index > -1) {
        subscription.unsubscribe()
        subscriptions.splice(index, 1)
      }
    },
    []
  )

  const unsubscribeAll = useCallback(() => {
    subscriptions.forEach((subscription) => {
      if (!subscription.isForever) {
        subscription.unsubscribe()
      }
    })
    subscriptions.length = 0
  }, [])

  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [unsubscribeAll])

  return { subscribe, unsubscribe, unsubscribeAll }
}
