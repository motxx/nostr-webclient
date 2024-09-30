import { useCallback, useContext } from 'react'
import { NoteService } from '@/infrastructure/services/NoteService'
import { SubscribeNotes } from '@/domain/use_cases/SubscribeNotes'
import { Note } from '@/domain/entities/Note'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { AuthStatus, SubscriptionStatus } from '@/context/types'
import { AppContext } from '@/context/AppContext'
import { OperationType } from '@/context/actions'
import { FetchPastNotes } from '@/domain/use_cases/FetchPastNotes'

export const useSubscribeNotes = () => {
  const {
    auth: { nostrClient, status },
    subscription: { notes, subscription, status: subscriptionStatus },
    dispatch,
  } = useContext(AppContext)

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

      dispatch({ type: OperationType.FetchPastNotesStart })

      new FetchPastNotes(noteService).execute({ ...options, limit: 20 }).match(
        (notes) => {
          dispatch({ type: OperationType.FetchPastNotesEnd, notes })
        },
        (error) => {
          dispatch({ type: OperationType.FetchPastNotesError, error })
        }
      )

      new SubscribeNotes(noteService)
        .execute((note: Note) => {
          dispatch({ type: OperationType.AddNewNote, note })
        }, options)
        .match(
          (subscription) => {
            console.log('options', options)
            dispatch({ type: OperationType.SubscribeNotes, subscription })
          },
          (error) => {
            dispatch({ type: OperationType.SubscriptionError, error })
          }
        )
    },
    [nostrClient, dispatch, status, subscriptionStatus]
  )

  const unsubscribe = useCallback(() => {
    if (!subscription) return
    subscription.unsubscribe()
    dispatch({ type: OperationType.UnsubscribeNotes })
  }, [subscription, dispatch])

  return { subscribe, unsubscribe, notes }
}
