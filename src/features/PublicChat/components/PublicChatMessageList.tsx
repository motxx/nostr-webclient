import { PublicChatMessage } from '@/domain/entities/PublicChat'
import React from 'react'
import PublicChatSingleMessage from './PublicChatSingleMessage'

const DateSeparator: React.FC<{ date: string }> = ({ date }) => (
  <div className="relative my-4">
    <div className="flex items-center">
      <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
      <span className="mx-4 text-gray-500 text-sm font-bold bg-transparent">
        {date}
      </span>
      <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
    </div>
  </div>
)

export const PublicChatMessageList: React.FC<{
  messages: PublicChatMessage[]
  isNewDay: (currentMessage: any, previousMessage: any) => boolean
  formatDate: (timestamp: string) => string
  messageWindowRef: React.RefObject<HTMLDivElement>
}> = ({ messages, isNewDay, formatDate, messageWindowRef }) => (
  <div className="flex-grow overflow-auto relative" ref={messageWindowRef}>
    <div className="p-4 relative">
      {messages.map((message, index) => (
        <React.Fragment key={message.id}>
          {isNewDay(message, messages[index - 1]) && (
            <DateSeparator
              date={formatDate(message.created_at.toISOString())}
            />
          )}
          <PublicChatSingleMessage message={message} />
        </React.Fragment>
      ))}
    </div>
  </div>
)
