import React, { useState } from 'react'
import MessageConversation from '../components/Message/MessageConversation'
import MessageCreateChatModal from '../components/Message/MessageCreateChatModal'
import MessageChatSidebar from '../components/Message/MessageChatSidebar'
import { mockConversations } from '../data/dummy-message-conversations'
import { MessageConversationType } from '../global/types'

const MessagePage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] =
    useState<MessageConversationType | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [conversations, setConversations] = useState(mockConversations)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    )
    setSelectedConversation(conversation ?? null)
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

  const handleCreateChat = (chatName: string, participants: string[]) => {
    const newChat = {
      id: String(conversations.length + 1),
      name: chatName,
      avatar: 'https://randomuser.me/api/portraits/women/8.jpg',
      members: participants,
      messages: [],
    }
    setConversations([...conversations, newChat])
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
      <MessageChatSidebar
        conversations={conversations}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredConversations={filteredConversations}
        handleSelectConversation={handleSelectConversation}
        setIsModalOpen={setIsModalOpen}
      />
      <div className="flex-1">
        {selectedConversation ? (
          <MessageConversation
            conversation={selectedConversation}
            onSendMessage={handleSendMessage}
          />
        ) : (
          <></>
        )}
      </div>
      <MessageCreateChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  )
}

export default MessagePage
