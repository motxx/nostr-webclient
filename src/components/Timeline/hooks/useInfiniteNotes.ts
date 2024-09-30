import { useCallback, useContext, useEffect } from 'react'
import { AppContext } from '@/context/AppContext'
import { useSubscribeNotes } from './useSubscribeNotes'
import { AuthStatus, SubscriptionStatus } from '@/context/types'

interface UseInfiniteNotesOptions {
  authorPubkeys?: string[]
  limit?: number
  hashtag?: string // TODO: implement hashtag filtering
}

export const useInfiniteNotes = ({
  authorPubkeys,
  limit = 20,
  hashtag,
}: UseInfiniteNotesOptions) => {
  const {
    auth: { status: authStatus },
    subscription: { status: subscriptionStatus, notes },
  } = useContext(AppContext)
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
