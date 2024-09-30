import { useCallback, useEffect, useContext } from 'react'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { SubscribeDirectMessages } from '@/domain/use_cases/SubscribeDirectMessages'
import { Conversation } from '@/domain/entities/Conversation'
import { SubscribeDirectMessagesOptions } from '@/domain/repositories/DirectMessageRepository'
import { AppContext } from '@/context/AppContext'
import { AuthStatus } from '@/context/types'
const subscriptions: Array<{
  isForever: boolean
  unsubscribe: () => void
}> = []

export const useSubscribeMessages = () => {
  const {
    auth: { nostrClient, status },
  } = useContext(AppContext)

  const subscribe = useCallback(
    (
      onConversation: (conversation: Conversation) => void,
      options?: SubscribeDirectMessagesOptions
    ) => {
      if (status !== AuthStatus.ClientReady && status !== AuthStatus.LoggedIn) {
        return
      }
      if (!nostrClient) {
        throw new Error('NostrClient is not ready')
      }

      const subscription = new SubscribeDirectMessages(
        new DirectMessageService(nostrClient)
      ).execute(onConversation, {
        isForever: options?.isForever ?? false,
      })
      if (subscription.isOk()) {
        subscriptions.push({
          isForever: options?.isForever ?? false,
          unsubscribe: subscription.value.unsubscribe,
        })
      } else {
        console.error(
          'Failed to subscribe to direct messages:',
          subscription.error
        )
      }
      return subscription
    },
    [nostrClient, status]
  )

  const unsubscribe = useCallback((timeline: { unsubscribe: () => void }) => {
    const index = subscriptions.findIndex(
      (s) => s.unsubscribe === subscription.unsubscribe
    )
    if (index > -1) {
      subscription.unsubscribe()
      subscriptions.splice(index, 1)
    }
  }, [])

  const unsubscribeAll = useCallback(() => {
    subscriptions.forEach((subscription) => {
      if (!subscription.isForever) {
        subscription.unsubscribe()
      }
    })
    subscriptions.length = 0
  }, [])

  const anySubscriptionsExist = useCallback(() => {
    return subscriptions.length > 0
  }, [])

  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [unsubscribeAll])

  return { subscribe, unsubscribe, unsubscribeAll, anySubscriptionsExist }
}
