import React, { useState } from 'react'
import { FiSearch } from 'react-icons/fi'
import { IoMdSend } from 'react-icons/io'

const DirectMessagePage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [conversations, setConversations] = useState([
    {
      id: 1,
      name: 'User 1',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
      members: ['User 1'],
      messages: [
        {
          sender: 'User 1',
          avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
          content: 'Hello!',
        },
        {
          sender: 'You',
          avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
          content: 'Hi!',
        },
      ],
    },
    {
      id: 2,
      name: 'Group Chat',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
      members: ['User 2', 'User 3', 'You'],
      messages: [
        {
          sender: 'User 2',
          avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
          content: 'Hi everyone!',
        },
        {
          sender: 'User 3',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
          content: 'Hello!',
        },
        {
          sender: 'You',
          avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
          content: 'How are you?',
        },
      ],
    },
  ])

  const handleSelectConversation = (conversationId: number) => {
    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    )
    setSelectedConversation(conversation)
  }

  const handleSendMessage = (content: string) => {
    if (!selectedConversation) return

    const updatedConversations = conversations.map((conv) =>
      conv.id === selectedConversation.id
        ? {
            ...conv,
            messages: [
              ...conv.messages,
              {
                sender: 'You',
                avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
                content,
              },
            ],
          }
        : conv
    )

    setConversations(updatedConversations)
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.messages.some((message) =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  return (
    <div className="flex h-full">
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <div className="relative">
            <div className="flex items-center w-full p-2 border border-gray-200 dark:border-gray-700 rounded-full">
              <FiSearch className="text-gray-700 dark:text-gray-300 mr-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="メッセージを検索"
                className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-gray-300"
              />
            </div>
          </div>
        </div>
        <ul>
          {filteredConversations.map((conversation) => (
            <li
              key={conversation.id}
              className="px-4 sm:px-6 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-900 transition duration-300 ease-in-out cursor-pointer"
              onClick={() => handleSelectConversation(conversation.id)}
            >
              <img
                src={conversation.avatar}
                alt={conversation.name}
                className="w-8 h-8 rounded-full mr-2"
              />
              <div className="flex flex-col">
                <span>{conversation.name}</span>
                {conversation.members.length > 2 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {conversation.members.join(', ')}
                  </span>
                )}
                <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                  {
                    conversation.messages[conversation.messages.length - 1]
                      .content
                  }
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 p-4">
        {selectedConversation ? (
          <Conversation
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

const Conversation: React.FC<{
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
      <div className="flex-1 overflow-y-auto">
        {conversation.messages.map((message: any, index: number) => (
          <div
            key={index}
            className={`flex ${message.sender === 'You' ? 'justify-end' : 'justify-start'} p-2`}
          >
            {message.sender !== 'You' && (
              <img
                src={message.avatar}
                alt={message.sender}
                className="w-8 h-8 rounded-full mr-2"
              />
            )}
            <div
              className={`max-w-xs px-4 py-2 rounded-[3rem] ${message.sender === 'You' ? 'bg-blue-500 text-white rounded-br-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-bl-md'}`}
            >
              {message.content}
            </div>
            {message.sender === 'You' && (
              <img
                src={message.avatar}
                alt={message.sender}
                className="w-8 h-8 rounded-full ml-2"
              />
            )}
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

export default DirectMessagePage
