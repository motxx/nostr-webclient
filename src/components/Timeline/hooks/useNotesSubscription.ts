import { useCallback, useContext } from 'react'
import { NoteService } from '@/infrastructure/services/NoteService'
import { SubscribeNotes } from '@/domain/use_cases/SubscribeNotes'
import { Note } from '@/domain/entities/Note'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { AuthStatus, TimelineStatus } from '@/context/types'
import { AppContext } from '@/context/AppContext'
import { OperationType } from '@/context/actions'
import { FetchPastNotes } from '@/domain/use_cases/FetchPastNotes'

export const useNotesSubscription = () => {
  const {
    auth: { nostrClient, status: authStatus },
    timeline: { notes, subscription, status: timelineStatus },
    dispatch,
  } = useContext(AppContext)

  const subscribe = useCallback(
    (options: SubscribeNotesOptions, callbackWhenFinished?: () => void) => {
      if (
        authStatus !== AuthStatus.ClientReady &&
        authStatus !== AuthStatus.LoggedIn
      ) {
        return
      }
      if (!nostrClient) throw new Error('NostrClient is not ready')

      if (timelineStatus !== TimelineStatus.Idle) {
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
            dispatch({ type: OperationType.SubscribeNotes, subscription })
          },
          (error) => {
            dispatch({ type: OperationType.SubscribeNotesError, error })
          }
        )
    },
    [nostrClient, dispatch, authStatus, timelineStatus]
  )

  const unsubscribe = useCallback(() => {
    if (!subscription) return
    subscription.unsubscribe()
    dispatch({ type: OperationType.UnsubscribeNotes })
  }, [subscription, dispatch])

  return { subscribe, unsubscribe, notes }
}
