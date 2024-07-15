import UserAvatar from '@/components/ui-elements/UserAvatar'
import { PublicChatMessage } from '@/domain/entities/PublicChat'
import React from 'react'

interface PublicChatSingleMessageProps {
  message: PublicChatMessage
}

const PublicChatSingleMessage: React.FC<PublicChatSingleMessageProps> = ({
  message,
}) => {
  return (
    <div className="flex items-start space-x-4 p-4">
      <UserAvatar
        src={message.author.profile?.image}
        name={message.author.npub}
        size={40}
      />
      <div>
        <div className="flex space-x-2">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {message.author.profile?.displayName ||
              message.author.profile?.name ||
              message.author.profile?.nostrAddress ||
              message.author.npub}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {message.created_at.toISOString()}
          </div>
        </div>
        <div className="mt-2 text-gray-700 dark:text-gray-300">
          {message.content}
        </div>
      </div>
    </div>
  )
}

export default PublicChatSingleMessage
