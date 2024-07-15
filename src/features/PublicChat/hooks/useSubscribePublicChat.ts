import { useCallback, useEffect } from 'react'
import { PublicChatService } from '@/infrastructure/services/PublicChatService'
import { PublicChatMessage } from '@/domain/entities/PublicChat'
import { useNostrClient } from '@/hooks/useNostrClient'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'

const subscriptions: Array<{
  isForever?: boolean
  unsubscribe: () => void
}> = []

export const useSubscribePublicChat = () => {
  const { nostrClient, refreshClient } = useNostrClient()

  const subscribe = useCallback(
    async (
      channelId: string,
      onMessage: (message: PublicChatMessage) => void,
      options?: {
        limit?: number
        until?: Date
        isForever?: boolean
      }
    ) => {
      if (!nostrClient) {
        return
      }
      const userProfileRepository = new UserProfileService(nostrClient)
      const publicChatService = new PublicChatService(
        nostrClient,
        userProfileRepository
      )

      const subscriptionResult = publicChatService.subscribeToChannelMessages(
        channelId,
        onMessage,
        options
      )

      if (subscriptionResult.isOk()) {
        const subscription = subscriptionResult.value
        subscriptions.push({
          isForever: options?.isForever,
          unsubscribe: subscription.unsubscribe,
        })
        return subscription
      } else {
        console.error('Failed to subscribe:', subscriptionResult.error)
      }
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
    refreshClient()
  }, [refreshClient])

  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [unsubscribeAll])

  return { subscribe, unsubscribe, unsubscribeAll }
}
