import { useCallback, useEffect } from 'react'
import { PublicChatMessage } from '@/domain/entities/PublicChat'
import { useAtomValue } from 'jotai'
import { AuthStatus, authStatusAtom } from '@/state/auth'
import { publicChatServiceAtom } from '@/state/services'

const subscriptions: Array<{
  isForever?: boolean
  unsubscribe: () => void
}> = []

export const useSubscribePublicChat = () => {
  const authStatus = useAtomValue(authStatusAtom)
  const publicChatService = useAtomValue(publicChatServiceAtom)

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
      if (
        authStatus !== AuthStatus.ClientReady &&
        authStatus !== AuthStatus.LoggedIn
      ) {
        return
      }
      if (!publicChatService) return

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
    [authStatus, publicChatService]
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

  useEffect(() => {
    return () => {
      unsubscribeAll()
    }
  }, [unsubscribeAll])

  return { subscribe, unsubscribe, unsubscribeAll }
}
