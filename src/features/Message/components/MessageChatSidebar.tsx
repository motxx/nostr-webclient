import React, { forwardRef } from 'react'
import { LuMessageSquarePlus } from 'react-icons/lu'
import classNames from 'classnames'
import SearchInput from '@/components/ui-parts/SearchInput'
import Button from '@/components/ui-elements/Button'
import { Conversation } from '@/domain/entities/Conversation'

interface MessageChatSidebarProps {
  conversations: Conversation[]
  searchTerm: string
  setSearchTerm: (term: string) => void
  filteredConversations: Conversation[]
  handleSelectConversation: (conversationId: string, subject?: string) => void
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
  ) => (
    <div
      className={classNames(
        'w-full sm:w-1/3 sm:border-r sm:border-gray-200 sm:dark:border-gray-700 h-screen overflow-y-auto hide-scrollbar',
        className
      )}
    >
      <div className="p-4">
        <div className="flex items-center mb-4">
          <h1 className="text-lg font-bold">メッセージ</h1>
          <Button className="ml-auto" onClick={() => setIsModalOpen(true)}>
            <LuMessageSquarePlus className="text-2xl hover:text-blue-500 transition" />
          </Button>
        </div>
        <SearchInput
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="メッセージを検索..."
        />
      </div>
      <ul className="mb-20 sm:mb-0">
        {filteredConversations.map((conversation) => (
          <li
            key={conversation.id}
            className="px-4 sm:px-6 py-2 flex items-center hover:bg-gray-100 dark:hover:bg-gray-900 transition duration-300 ease-in-out cursor-pointer"
            onClick={() =>
              handleSelectConversation(conversation.id, conversation.subject)
            }
          >
            <div className="flex flex-col">
              <span>{conversation.subject || 'Conversation'}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {Array.from(conversation.participants)
                  .map((p) => p.user.npub)
                  .join(', ')}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 truncate">
                {conversation.lastMessage?.content || 'No messages yet'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
)

export default MessageChatSidebar
