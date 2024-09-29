import { useCallback, useContext, useEffect } from 'react'
import { useSubscribeNotes } from './useSubscribeNotes'
import {
  SubscriptionContext,
  SubscriptionStatus,
} from '@/context/SubscriptionContext'
import { AuthContext, AuthStatus } from '@/context/AuthContext'

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
  const { status: authStatus } = useContext(AuthContext)
  const { status: subscriptionStatus } = useContext(SubscriptionContext)
  const { subscribe, unsubscribe, notes } = useSubscribeNotes()
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
