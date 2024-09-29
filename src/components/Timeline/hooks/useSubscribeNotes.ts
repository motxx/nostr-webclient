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
  SubscriptionStatus,
} from '@/context/SubscriptionContext'
import { FetchPastNotes } from '@/domain/use_cases/FetchPastNotes'

export const useSubscribeNotes = () => {
  const { nostrClient, status } = useContext(AuthContext)
  const {
    dispatch: subscriptionDispatch,
    notes,
    subscription,
    status: subscriptionStatus,
  } = useContext(SubscriptionContext)

  const subscribe = useCallback(
    (options: SubscribeNotesOptions, callbackWhenFinished?: () => void) => {
      if (status !== AuthStatus.ClientReady && status !== AuthStatus.LoggedIn) {
        return
      }
      if (!nostrClient) throw new Error('NostrClient is not ready')

      if (subscriptionStatus !== SubscriptionStatus.Idle) {
        return
      }

      const userProfileService = new UserProfileService(nostrClient)
      const noteService = new NoteService(nostrClient, userProfileService)

      subscriptionDispatch({
        type: SubscriptionOperationType.FetchPastNotesStart,
      })

      new FetchPastNotes(noteService).execute({ ...options, limit: 20 }).match(
        (notes) => {
          subscriptionDispatch({
            type: SubscriptionOperationType.FetchPastNotesEnd,
            notes,
          })
        },
        (error) => {
          console.error('Failed to fetch past notes', error)
        }
      )

      new SubscribeNotes(noteService)
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
    [nostrClient, subscriptionDispatch, status, subscriptionStatus]
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
