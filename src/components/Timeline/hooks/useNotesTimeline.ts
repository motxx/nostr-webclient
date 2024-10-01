import { useCallback, useContext, useEffect } from 'react'
import { AppContext } from '@/context/AppContext'
import { AuthStatus, TimelineStatus } from '@/context/types'
import { useNotesSubscription } from './useNotesSubscription'

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
    auth: { status: authStatus },
    timeline: { status: timelineStatus, notes },
  } = useContext(AppContext)
  const { subscribe, unsubscribe } = useNotesSubscription()

  const isTimelineLoading =
    timelineStatus !== TimelineStatus.Subscribing || notes.length === 0

  const handleSubscription = useCallback(() => {
    if (
      (authStatus !== AuthStatus.ClientReady &&
        authStatus !== AuthStatus.LoggedIn) ||
      timelineStatus !== TimelineStatus.Idle
    ) {
      return
    }

    subscribe({ authorPubkeys, limit, hashtag })
  }, [authorPubkeys, authStatus, timelineStatus, subscribe, limit, hashtag])

  useEffect(() => {
    handleSubscription()
    return () => {
      unsubscribe()
    }
  }, [handleSubscription, unsubscribe])

  return { notes, isTimelineLoading }
}
