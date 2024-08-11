import React, { useState } from 'react'
import { IoMdSend } from 'react-icons/io'
import { FiArrowLeft } from 'react-icons/fi'
import Button from '@/components/ui-elements/Button'
import Input from '@/components/ui-elements/Input'
import { Conversation } from '@/domain/entities/Conversation'

const MessageConversation: React.FC<{
  conversation: Conversation
  onSendMessage: (content: string) => void
  onBack: () => void
}> = ({ conversation, onSendMessage, onBack }) => {
  const [newMessage, setNewMessage] = useState('')

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-y-auto hide-scrollbar">
      <div className="sticky top-0 z-30 bg-white dark:bg-black flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <Button onClick={onBack} className="sm:hidden mr-4">
          <FiArrowLeft className="text-2xl" />
        </Button>
        <div>
          <div className="font-bold">
            {conversation.subject || 'Conversation'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {Array.from(conversation.participants)
              .map((p) => p.user.npub)
              .join(', ')}
          </div>
        </div>
      </div>
      <div className="ml-2 mr-2 flex-1 mb-10 sm:mb-0">
        {conversation.messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.sender.npub === conversation.participants[0].user.npub ? 'justify-end' : 'justify-start'} p-2`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-[3rem] ${
                message.sender.npub === conversation.participants[0].user.npub
                  ? 'bg-blue-500 text-white rounded-br-md'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-md'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <div className="z-30 sticky bottom-20 sm:bottom-0 mb-10 sm:mb-0 p-2 sm:px-4 sm:border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
        <form
          className="flex"
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="メッセージを入力..."
            className="flex-grow rounded-full px-4 sm:px-0 sm:rounded-none w-full bg-gray-300 dark:bg-gray-800 sm:bg-transparent sm:dark:bg-transparent text-gray-700 dark:text-gray-300"
          />
          <Button
            type="submit"
            className="ml-1 p-2 flex justify-center items-center bg-blue-500 dark:bg-gray-800 text-white rounded-full sm:rounded"
          >
            <IoMdSend className="text-xl" />
          </Button>
        </form>
      </div>
    </div>
  )
}

export default MessageConversation
