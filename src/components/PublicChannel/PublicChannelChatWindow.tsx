import React, { useState } from 'react'

interface PublicChannelChatWindowProps {
  channelId: string | null
}

const PublicChannelChatWindow: React.FC<PublicChannelChatWindowProps> = ({
  channelId,
}) => {
  const [messages, setMessages] = useState<string[]>([])
  const [newMessage, setNewMessage] = useState<string>('')

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      setMessages([...messages, newMessage])
      setNewMessage('')
    }
  }

  return (
    <div className="w-3/4 bg-white dark:bg-black p-4 flex flex-col">
      <div className="flex-grow overflow-auto">
        <h2 className="text-lg font-bold mb-4">
          {channelId ? `Channel ${channelId}` : 'Select a channel'}
        </h2>
        {channelId && (
          <div>
            {messages.map((message, index) => (
              <div
                key={index}
                className="mb-2 p-2 bg-gray-100 dark:bg-gray-900 rounded"
              >
                {message}
              </div>
            ))}
          </div>
        )}
      </div>
      {channelId && (
        <div className="mt-4 flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow p-2 border border-gray-300 dark:border-gray-700 rounded"
            placeholder="Type your message"
          />
          <button
            onClick={handleSendMessage}
            className="ml-2 p-2 bg-blue-500 text-white rounded"
          >
            Send
          </button>
        </div>
      )}
    </div>
  )
}

export default PublicChannelChatWindow
