import { useCallback, useContext } from 'react'
import { NoteService } from '@/infrastructure/services/NoteService'
import { SubscribeNotes } from '@/domain/use_cases/SubscribeNotes'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { AuthStatus, TimelineStatus } from '@/context/types'
import { AppContext } from '@/context/AppContext'
import { OperationType } from '@/context/actions'
import { FetchPastNotes } from '@/domain/use_cases/FetchPastNotes'

export const useNotesSubscription = () => {
  const {
    auth: { nostrClient, status: authStatus },
    timeline: { notes, status: timelineStatus, subscription },
    dispatch,
  } = useContext(AppContext)

  const subscribe = useCallback(
    (options: SubscribeNotesOptions) => {
      if (
        (authStatus !== AuthStatus.ClientReady &&
          authStatus !== AuthStatus.LoggedIn) ||
        timelineStatus !== TimelineStatus.Idle
      ) {
        return
      }
      if (!nostrClient) throw new Error('NostrClient is not ready')

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

      const subscription = new SubscribeNotes(noteService)
        .execute(options)
        .subscribe({
          next: (note) => {
            dispatch({ type: OperationType.AddNewNote, note })
          },
          error: (error) => {
            dispatch({ type: OperationType.SubscribeNotesError, error })
          },
        })

      dispatch({ type: OperationType.SubscribeNotes, subscription })
    },
    [nostrClient, dispatch, authStatus, timelineStatus]
  )

  const unsubscribe = useCallback(() => {
    if (subscription) {
      subscription.unsubscribe()
      dispatch({ type: OperationType.UnsubscribeNotes })
    }
  }, [subscription, dispatch])

  return { subscribe, unsubscribe, notes }
}
