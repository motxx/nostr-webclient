import React, { useState, useEffect } from 'react'
import MessageConversation from './components/MessageConversation'
import MessageCreateChatModal from './components/MessageCreateChatModal'
import MessageChatSidebar from './components/MessageChatSidebar'
import { Conversation } from '@/domain/entities/Conversation'
import { User } from '@/domain/entities/User'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { FetchUserConversations } from '@/domain/use_cases/FetchUserConversations'
import { SendDirectMessage } from '@/domain/use_cases/SendDirectMessage'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { UserService } from '@/infrastructure/services/UserService'
import { getNostrClient } from '@/infrastructure/nostr/nostrClient'
import { useNostrClient } from '@/hooks/useNostrClient'
import { useAtom } from 'jotai'
import { loggedInUserSelector } from '@/state/selectors'
import { ok, ResultAsync } from 'neverthrow'
import { FetchUser } from '@/domain/use_cases/FetchUser'
import { hexToBech32 } from '@/utils/addressConverter'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { Participant } from '@/domain/entities/Participant'

const MessagePage: React.FC = () => {
  const { nostrClient } = useNostrClient()
  const [loggedInUser] = useAtom(loggedInUserSelector)
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const initializeAndFetchData = async () => {
      if (!nostrClient || !loggedInUser) {
        return
      }

      const directMessageService = new DirectMessageService(nostrClient)
      new FetchUserConversations(directMessageService)
        .execute(loggedInUser)
        .andThen((conversations) => {
          setConversations(conversations)
          return ok(undefined)
        })
        .mapErr((error) => {
          console.error('Failed to fetch conversations:', error)
        })
    }

    initializeAndFetchData()
  }, [loggedInUser, nostrClient])

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversations.find(
      (conv) => conv.id === conversationId
    )
    setSelectedConversation(conversation ?? null)
  }

  const handleSendMessage = (content: string) => {
    if (!selectedConversation || !loggedInUser || !nostrClient) return

    const newMessage = DirectMessage.create(
      loggedInUser,
      Array.from(selectedConversation.participants),
      content,
      selectedConversation.subject
    )

    const directMessageService = new DirectMessageService(nostrClient)
    new SendDirectMessage(directMessageService)
      .execute(newMessage)
      .andThen(() => {
        const updatedConversation = selectedConversation.addMessage(newMessage)
        setSelectedConversation(updatedConversation)
        setConversations(
          conversations.map((conv) =>
            conv.id === updatedConversation.id ? updatedConversation : conv
          )
        )
        return ok(undefined)
      })
      .mapErr((error) => {
        console.error('Failed to send message:', error)
      })
  }

  const handleCreateChat = (
    chatName: string,
    participantsPubkeys: string[]
  ) => {
    if (!loggedInUser || !nostrClient) return

    const conversationId = Conversation.generateId(participantsPubkeys)
    const conversationExists = conversations.some(
      (conv) => conv.id === conversationId
    )
    if (conversationExists) return

    const userProfileService = new UserProfileService(nostrClient)
    const fetchUsers = ResultAsync.combine(
      participantsPubkeys.map((pubkey) =>
        hexToBech32(pubkey).asyncAndThen((npub) =>
          new FetchUser(userProfileService).execute(npub)
        )
      )
    )

    fetchUsers
      .map((users) => {
        const participants = new Set(
          users.map((user) => new Participant(user, 'wss://relay.hakua.xyz'))
        )
        return Conversation.create(participants, chatName)
      })
      .andThen((newConversation) => {
        setConversations((prevConversations) => [
          ...prevConversations,
          newConversation,
        ])
        return ok(undefined)
      })
      .mapErr((error) => console.error('Failed to create chat:', error))
  }

  const filteredConversations = conversations.filter(
    (conversation) =>
      conversation.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conversation.messages.some((message) =>
        message.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
  )

  return (
    <div className="flex h-full">
      <MessageChatSidebar
        className={selectedConversation ? 'hidden sm:block' : 'block'}
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
            onBack={() => setSelectedConversation(null)}
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
