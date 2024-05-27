import React, { useState, useEffect } from 'react'
import PublicChannelChatMessage from './PublicChannelChatMessage'
import { mockMessages } from '../../data/dummy-mock-messages'
import { PublicChannelType } from '../../global/types'

interface PublicChannelChatWindowProps {
  channel?: PublicChannelType
}

const PublicChannelChatWindow: React.FC<PublicChannelChatWindowProps> = ({
  channel,
}) => {
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState<string>('')

  useEffect(() => {
    // モックデータを使用してメッセージを設定する
    setMessages(mockMessages)
  }, [])

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const newMsg = {
        id: String(messages.length + 1),
        user: {
          name: 'CurrentUser',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        },
        content: newMessage,
        timestamp: new Date().toLocaleString(),
      }
      setMessages([...messages, newMsg])
      setNewMessage('')
    }
  }

  return (
    <div className="w-3/4 flex flex-col h-full">
      <div className="flex-grow overflow-auto p-4">
        <h2 className="text-lg font-bold mb-4">
          {channel ? `# ${channel.name}` : 'Select a channel'}
        </h2>
        {channel && (
          <div>
            {messages.map((message) => (
              <PublicChannelChatMessage key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>
      {channel && (
        <div className="z-10 sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
          <div className="flex">
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
        </div>
      )}
    </div>
  )
}

export default PublicChannelChatWindow
