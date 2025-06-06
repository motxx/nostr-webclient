import { useCallback, useContext, useEffect, useRef } from 'react'
import { AppContext } from '@/context/AppContext'
import { AuthStatus } from '@/context/types'
import { NoteService } from '@/infrastructure/services/NoteService'
import { SubscribeNotes } from '@/domain/use_cases/SubscribeNotes'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { Subscription } from 'rxjs'
import { useAppDispatch, useAppSelector } from '@/state/hooks'
import { addNote, fetchPastNotes, setStatus, TimelineStatus } from '@/state/features/timeline/timelineSlice'

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
  } = useContext(AppContext)
  
  const dispatch = useAppDispatch()
  const { notes, status } = useAppSelector((state) => state.timeline)

  // 再レンダリングを防ぐためにuseRefを使う(timeline.statusは依存配列に影響するので使わない)
  const subscriptionRef = useRef<Subscription | null>(null)
  const isSubscribingRef = useRef<boolean>(false)

  const isTimelineLoading = status === TimelineStatus.Subscribing || (status === TimelineStatus.Idle && notes.length === 0)

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

      dispatch(fetchPastNotes({ options: { ...options, limit: 20 }, noteService }))

      const subscription = new SubscribeNotes(noteService)
        .execute(options)
        .subscribe({
          next: (note) => {
            dispatch(addNote(note))
          },
          error: (error) => {
            dispatch(setStatus(TimelineStatus.Error))
            console.error('Error subscribing to notes:', error)
          },
        })

      subscriptionRef.current = subscription
      dispatch(setStatus(TimelineStatus.Subscribing))
    },
    [nostrClient, dispatch, authStatus]
  )

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      isSubscribingRef.current = false
      dispatch(setStatus(TimelineStatus.Idle))
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
