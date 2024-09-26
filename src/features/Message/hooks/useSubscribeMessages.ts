import { useCallback, useEffect } from 'react'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { SubscribeDirectMessages } from '@/domain/use_cases/SubscribeDirectMessages'
import { Conversation } from '@/domain/entities/Conversation'
import { SubscribeDirectMessagesOptions } from '@/domain/repositories/DirectMessageRepository'
import { useAuth } from '@/hooks/useAuth'

const subscriptions: Array<{
  isForever: boolean
  unsubscribe: () => void
}> = []

export const useSubscribeMessages = () => {
  const { nostrClient } = useAuth()

  const subscribe = useCallback(
    (
      onConversation: (conversation: Conversation) => void,
      options?: SubscribeDirectMessagesOptions
    ) => {
      if (!nostrClient) {
        return
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
    [nostrClient]
  )

  const unsubscribe = useCallback(
    (subscription: { unsubscribe: () => void }) => {
      const index = subscriptions.findIndex(
        (s) => s.unsubscribe === subscription.unsubscribe
      )
      if (index > -1) {
        subscription.unsubscribe()
        subscriptions.splice(index, 1)
      }
    },
    []
  )

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
