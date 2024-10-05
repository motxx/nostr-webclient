import { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@/context/AppContext'
import { AuthStatus } from '@/context/types'
import { NoteService } from '@/infrastructure/services/NoteService'
import { SubscribeNotes } from '@/domain/use_cases/SubscribeNotes'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { OperationType } from '@/context/actions'
import { FetchPastNotes } from '@/domain/use_cases/FetchPastNotes'
import { Subscription } from 'rxjs'

interface UseNotesTimelineOptions {
  authorPubkeys?: string[]
  limit?: number
  hashtag?: string // TODO: implement hashtag filtering
}

export const useNotesTimeline = ({
  authorPubkeys,
  limit = 20,
  hashtag,
}: UseNotesTimelineOptions) => {
  const {
    auth: { nostrClient, status: authStatus },
    timeline: { notes },
    dispatch,
  } = useContext(AppContext)

  // 再レンダリングを防ぐためにuseRefを使う(timeline.statusは依存配列に影響するので使わない)
  const subscriptionRef = useRef<Subscription | null>(null)
  const isSubscribingRef = useRef<boolean>(false)

  const isTimelineLoading =
    isSubscribingRef.current !== null || notes.length === 0

  const subscribe = useCallback(
    (options: SubscribeNotesOptions) => {
      if (
        authStatus !== AuthStatus.ClientReady &&
        authStatus !== AuthStatus.LoggedIn
      ) {
        return
      }
      if (!nostrClient) throw new Error('NostrClient is not ready')

      if (isSubscribingRef.current) {
        return
      }
      isSubscribingRef.current = true

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

      subscriptionRef.current = subscription

      dispatch({ type: OperationType.SubscribeNotes })
    },
    [nostrClient, dispatch, authStatus]
  )

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      isSubscribingRef.current = false
      dispatch({ type: OperationType.UnsubscribeNotes })
    }
  }, [dispatch])

  useEffect(() => {
    if (isSubscribingRef.current) {
      return
    }

    subscribe({ authorPubkeys, limit, hashtag })

    return () => {
      unsubscribe()
    }
  }, [authorPubkeys, authStatus, subscribe, unsubscribe, limit, hashtag])

  return { notes, isTimelineLoading }
}
