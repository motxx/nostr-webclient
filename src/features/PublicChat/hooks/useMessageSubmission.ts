import { FormEvent } from 'react'
import { useAtomValue } from 'jotai'
import { publicChatServiceAtom } from '@/state/services'

export const useMessageSubmission = (
  channelId: string,
  newMessage: string,
  setNewMessage: (value: string) => void
) => {
  const publicChatService = useAtomValue(publicChatServiceAtom)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newMessage.trim() !== '' && publicChatService) {
      try {
        const result = await publicChatService.postChannelMessage(
          channelId,
          newMessage
        )
        if (result.isErr()) {
          throw result.error
        }
        setNewMessage('')
      } catch (error) {
        console.error('Failed to post message:', error)
      }
    }
  }

  return { handleSubmit }
}
