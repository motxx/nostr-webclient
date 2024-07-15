import { useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { PublicChatMessage } from '@/domain/entities/PublicChat'
import { useSubscribePublicChat } from './useSubscribePublicChat'
import { publicChatMessagesFamily } from '@/state/atoms'

export const usePublicChatMessages = (channelId: string) => {
  const [messages, setMessages] = useAtom(publicChatMessagesFamily(channelId))
  const { subscribe, unsubscribeAll } = useSubscribePublicChat()

  const handleMessage = useCallback(
    (message: PublicChatMessage) => {
      setMessages((prevMessages) => {
        if (prevMessages.some((m) => m.id === message.id)) return prevMessages
        return [...prevMessages, message].sort(
          (a, b) => a.created_at.getTime() - b.created_at.getTime()
        )
      })
    },
    [setMessages]
  )

  useEffect(() => {
    if (messages.length === 0) {
      subscribe(channelId, handleMessage, {
        limit: 20,
        isForever: true,
      })
    }

    return () => {
      unsubscribeAll()
    }
  }, [channelId, subscribe, unsubscribeAll, handleMessage, messages.length])

  return { messages }
}
