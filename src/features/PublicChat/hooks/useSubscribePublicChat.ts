import { useCallback, useEffect, useContext } from 'react'
import { PublicChatService } from '@/infrastructure/services/PublicChatService'
import { PublicChatMessage } from '@/domain/entities/PublicChat'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { AppContext } from '@/context/AppContext'
import { AuthStatus } from '@/context/types'

const subscriptions: Array<{
  isForever?: boolean
  unsubscribe: () => void
}> = []

export const useSubscribePublicChat = () => {
  const {
    auth: { nostrClient, status },
  } = useContext(AppContext)

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
      if (status !== AuthStatus.ClientReady && status !== AuthStatus.LoggedIn) {
        return
      }
      if (!nostrClient) {
        throw new Error('NostrClient is not ready')
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
    [nostrClient, status]
  )

  const unsubscribe = useCallback((timeline: { unsubscribe: () => void }) => {
    const index = subscriptions.findIndex(
      (s) => s.unsubscribe === timeline.unsubscribe
    )
    if (index > -1) {
      subscriptions[index].unsubscribe()
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

  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [unsubscribeAll])

  return { subscribe, unsubscribe, unsubscribeAll }
}
