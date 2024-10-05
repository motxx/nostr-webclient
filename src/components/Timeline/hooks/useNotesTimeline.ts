import { useContext, useEffect, useRef } from 'react'
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
  const { subscribe } = useNotesSubscription()

  const isTimelineLoading =
    timelineStatus !== TimelineStatus.Subscribing || notes.length === 0

  // 再レンダリングを防ぐためにuseRefを使う
  const isSubscribing = useRef<boolean>(false)

  useEffect(() => {
    if (
      (authStatus !== AuthStatus.ClientReady &&
        authStatus !== AuthStatus.LoggedIn) ||
      timelineStatus !== TimelineStatus.Idle ||
      isSubscribing.current
    ) {
      return
    }
    isSubscribing.current = true
    subscribe({ authorPubkeys, limit, hashtag })
  }, [authorPubkeys, authStatus, timelineStatus, subscribe, limit, hashtag])

  return { notes, isTimelineLoading }
}
