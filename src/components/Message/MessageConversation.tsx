import { useState } from 'react'
import { IoMdSend } from 'react-icons/io'

const MessageConversation: React.FC<{
  conversation: any
  onSendMessage: (content: string) => void
}> = ({ conversation, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('')

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage)
      setNewMessage('')
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="ml-2 mr-2 flex-1 overflow-y-auto">
        {conversation.messages.map((message: any, index: number) => (
          <div
            key={index}
            className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'} p-2`}
          >
            {message.sender !== 'You' && (
              <img
                src={message.avatar}
                alt={message.sender}
                className="w-8 h-8 mt-2 rounded-full mr-2"
              />
            )}
            <div
              className={`max-w-xs px-4 py-2 rounded-[3rem] ${message.sender === 'You' ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-md'}`}
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
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow rounded-full px-4 sm:px-0 sm:rounded-none outline-none w-full bg-gray-300 dark:bg-gray-800 sm:bg-transparent sm:dark:bg-transparent text-gray-700 dark:text-gray-300"
            placeholder="メッセージを入力..."
          />
          <button
            type="submit"
            className="ml-1 p-2 flex justify-center items-center bg-blue-500 dark:bg-gray-800 text-white rounded-full sm:rounded"
          >
            <IoMdSend className="text-xl" />
          </button>
        </form>
      </div>
    </div>
  )
}

export default MessageConversation
