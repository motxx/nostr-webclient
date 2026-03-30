import { useCallback, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { useSubscribeNotes } from './useSubscribeNotes'
import { AuthStatus, authStatusAtom } from '@/state/auth'
import {
  SubscriptionStatus,
  timelineSubscriptionStatusAtom,
  timelineNotesAtom,
} from '@/state/timeline'

interface UseInfiniteNotesOptions {
  authorPubkeys?: string[]
  limit?: number
  hashtag?: string
}

export const useInfiniteNotes = ({
  authorPubkeys,
  limit = 20,
  hashtag,
}: UseInfiniteNotesOptions) => {
  const authStatus = useAtomValue(authStatusAtom)
  const subscriptionStatus = useAtomValue(timelineSubscriptionStatusAtom)
  const notes = useAtomValue(timelineNotesAtom)
  const { subscribe, unsubscribe } = useSubscribeNotes()

  const isLoading =
    subscriptionStatus !== SubscriptionStatus.Subscribing || notes.length === 0

  const handleSubscription = useCallback(() => {
    if (
      (authStatus !== AuthStatus.ClientReady &&
        authStatus !== AuthStatus.LoggedIn) ||
      subscriptionStatus !== SubscriptionStatus.Idle
    ) {
      return
    }

    subscribe({ authorPubkeys, limit, hashtag })
  }, [authorPubkeys, authStatus, subscriptionStatus, subscribe, limit, hashtag])

  useEffect(() => {
    handleSubscription()
    return () => {
      unsubscribe()
    }
  }, [handleSubscription, unsubscribe])

  return { notes, isLoading }
}
