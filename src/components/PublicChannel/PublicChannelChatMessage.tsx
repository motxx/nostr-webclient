import React from 'react'

interface PublicChannelChatMessageProps {
  message: {
    user: {
      name: string
      avatar: string
    }
    content: string
    timestamp: string
  }
}

const PublicChannelChatMessage: React.FC<PublicChannelChatMessageProps> = ({
  message,
}) => {
  return (
    <div className="flex items-start space-x-4 p-4 border-b border-gray-200 dark:border-gray-700">
      <img
        src={message.user.avatar}
        alt={message.user.name}
        className="w-10 h-10 rounded-full"
      />
      <div>
        <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {message.user.name}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          {message.timestamp}
        </div>
        <div className="mt-2 text-gray-700 dark:text-gray-300">
          {message.content}
        </div>
      </div>
    </div>
  )
}

export default PublicChannelChatMessage
