import React, { forwardRef } from 'react'
import { FiSearch } from 'react-icons/fi'
import { LuMessageSquarePlus } from 'react-icons/lu'
import { MessageConversationType } from '../../global/types'
import classNames from 'classnames'

interface MessageChatSidebarProps {
  conversations: MessageConversationType[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredConversations: MessageConversationType[]
  handleSelectConversation: (conversationId: string) => void
  setIsModalOpen: (isOpen: boolean) => void
  className?: string
}

const MessageChatSidebar = forwardRef<HTMLDivElement, MessageChatSidebarProps>(
  (
    {
      conversations,
      searchTerm,
      setSearchTerm,
      filteredConversations,
      handleSelectConversation,
      setIsModalOpen,
      className,
    },
    ref
  ) => {
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value)
    }

    return (
      <div
        className={classNames(
          'w-full sm:w-1/3 sm:border-r sm:border-gray-200 sm:dark:border-gray-700 h-screen overflow-y-auto hide-scrollbar',
          className
        )}
      >
        <div className="p-4">
          <div className="flex items-center mb-4">
            <h1 className="text-lg font-bold">メッセージ</h1>
            <button className="ml-auto" onClick={() => setIsModalOpen(true)}>
              <LuMessageSquarePlus className="text-2xl hover:text-blue-500 transition" />
            </button>
          </div>
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
        <ul className="mb-20 sm:mb-0">
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
    )
  }
)

export default MessageChatSidebar
