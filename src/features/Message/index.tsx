import React, { useState, useMemo, useContext } from 'react'
import MessageConversation from './components/MessageConversation'
import MessageCreateConversationModal from './components/MessageCreateConversationModal'
import MessageChatSidebar from './components/MessageChatSidebar'
import { AppContext } from '@/context/AppContext'
import { AuthStatus } from '@/context/types'
import { useMessageActions } from './hooks/useMessageActions'
import { useMessageSubscription } from './hooks/useMessageSubscription'

const MessagePage: React.FC = () => {
  const {
    auth: { status },
  } = useContext(AppContext)
  const { createNewConversation, sendDirectMessage } = useMessageActions()
  const { conversations } = useMessageSubscription()
  const [selectedConversationIndex, setSelectedConversationIndex] = useState<
    number | null
  >(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSelectConversation = (conversationId: string) => {
    const index = conversations.findIndex((conv) => conv.id === conversationId)
    setSelectedConversationIndex(index !== -1 ? index : null)
  }

  const handleSendMessage = (content: string) => {
    if (selectedConversationIndex === null || status !== AuthStatus.LoggedIn) {
      return
    }
    const selectedConversation = conversations[selectedConversationIndex]
    sendDirectMessage(selectedConversation, content)
  }

  const handleCreateConversation = (
    chatName: string,
    otherParticipantPubkeys: string[]
  ) => {
    if (status !== AuthStatus.LoggedIn) {
      return
    }
    createNewConversation(chatName, otherParticipantPubkeys)
  }

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          conversation.subject
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          conversation.messages.some((message) =>
            message.content.toLowerCase().includes(searchTerm.toLowerCase())
          )
      ),
    [conversations, searchTerm]
  )

  return (
    <div className="flex h-full">
      <MessageChatSidebar
        className={
          selectedConversationIndex !== null ? 'hidden sm:block' : 'block'
        }
        conversations={conversations}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredConversations={filteredConversations}
        handleSelectConversation={handleSelectConversation}
        setIsModalOpen={setIsModalOpen}
      />
      <div className="flex-1">
        {selectedConversationIndex !== null ? (
          <MessageConversation
            conversation={conversations[selectedConversationIndex]}
            onSendMessage={handleSendMessage}
            onBack={() => setSelectedConversationIndex(null)}
          />
        ) : (
          <></>
        )}
      </div>
      <MessageCreateConversationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateConversation={handleCreateConversation}
      />
    </div>
  )
}

export default MessagePage
