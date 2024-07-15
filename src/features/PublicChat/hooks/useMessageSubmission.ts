import { FormEvent } from 'react'
import { useNostrClient } from '@/hooks/useNostrClient'
import { PublicChatService } from '@/infrastructure/services/PublicChatService'
import { PostChannelMessage } from '@/domain/use_cases/PostChannelMessage'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'

export const useMessageSubmission = (
  channelId: string,
  newMessage: string,
  setNewMessage: (value: string) => void
) => {
  const { nostrClient } = useNostrClient()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (newMessage.trim() !== '' && nostrClient) {
      const userProfileRepository = new UserProfileService(nostrClient)
      const publicChatService = new PublicChatService(
        nostrClient,
        userProfileRepository
      )
      const postChannelMessage = new PostChannelMessage(publicChatService)

      try {
        await postChannelMessage.execute(channelId, newMessage)
        setNewMessage('')
      } catch (error) {
        console.error('Failed to post message:', error)
      }
    }
  }

  return { handleSubmit }
}
