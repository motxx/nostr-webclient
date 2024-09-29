import { useCallback, useContext } from 'react'
import { NoteService } from '@/infrastructure/services/NoteService'
import { SubscribeNotes } from '@/domain/use_cases/SubscribeNotes'
import { Note } from '@/domain/entities/Note'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { AuthContext, AuthStatus } from '@/context/AuthContext'
import {
  OperationType as SubscriptionOperationType,
  SubscriptionContext,
} from '@/context/SubscriptionContext'

export const useSubscribeNotes = () => {
  const { nostrClient, status } = useContext(AuthContext)
  const {
    dispatch: subscriptionDispatch,
    notes,
    subscription,
  } = useContext(SubscriptionContext)

  const subscribe = useCallback(
    (options: SubscribeNotesOptions, callbackWhenFinished?: () => void) => {
      if (status !== AuthStatus.ClientReady && status !== AuthStatus.LoggedIn) {
        return
      }
      if (!nostrClient) throw new Error('NostrClient is not ready')

      const userProfileService = new UserProfileService(nostrClient)
      const noteService = new NoteService(nostrClient, userProfileService)
      const subscribeTimeline = new SubscribeNotes(noteService)

      subscribeTimeline
        .execute((note: Note) => {
          subscriptionDispatch({
            type: SubscriptionOperationType.AddNewNote,
            note,
          })
        }, options)
        .match(
          (subscription) => {
            console.log('options', options)
            subscriptionDispatch({
              type: SubscriptionOperationType.SubscribeNotes,
              subscription: {
                unsubscribe: subscription.unsubscribe,
              },
            })
          },
          (error) => {
            console.error('Failed to subscribe notes', error)
          }
        )
    },
    [nostrClient, subscriptionDispatch, status]
  )

  const unsubscribe = useCallback(() => {
    if (!subscription) return
    subscription.unsubscribe()
    subscriptionDispatch({
      type: SubscriptionOperationType.UnsubscribeNotes,
    })
  }, [subscription, subscriptionDispatch])

  return { subscribe, unsubscribe, notes }
}
