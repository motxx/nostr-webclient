import React, { useState, useEffect, useMemo } from 'react'
import MessageConversation from './components/MessageConversation'
import MessageCreateChatModal from './components/MessageCreateChatModal'
import MessageChatSidebar from './components/MessageChatSidebar'
import { Conversation } from '@/domain/entities/Conversation'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { SendDirectMessage } from '@/domain/use_cases/SendDirectMessage'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { ok, ResultAsync } from 'neverthrow'
import { FetchUser } from '@/domain/use_cases/FetchUser'
import { hexToBech32 } from '@/utils/addressConverter'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { Participant } from '@/domain/entities/Participant'
import { useSubscribeMessages } from './hooks/useSubscribeMessages'
import { useAuth } from '@/hooks/useAuth'

const MessagePage: React.FC = () => {
  const { nostrClient, loggedInUser } = useAuth()
  const { subscribe, anySubscriptionsExist } = useSubscribeMessages()
  const [selectedConversationIndex, setSelectedConversationIndex] = useState<
    number | null
  >(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (!anySubscriptionsExist()) {
      subscribe(
        (conversation) => {
          setConversations((conversations) => {
            if (conversation.messages.length !== 1) {
              throw new Error('Conversation does not have exactly one message.')
            }
            const existingConversation = conversations.find(
              (conv) => conv.id === conversation.id
            )
            if (existingConversation) {
              // TODO: Implement Conversations.merge()
              return conversations.map((conv) =>
                conv.id === conversation.id
                  ? conv.addMessage(conversation.messages[0])
                  : conv
              )
            }
            console.log('conversation', conversation)
            return [...conversations, conversation]
          })
        },
        { isForever: true }
      )
    }
  }, [loggedInUser, nostrClient, anySubscriptionsExist, subscribe])

  const handleSelectConversation = (conversationId: string) => {
    const index = conversations.findIndex((conv) => conv.id === conversationId)
    setSelectedConversationIndex(index !== -1 ? index : null)
  }

  const handleSendMessage = (content: string) => {
    if (selectedConversationIndex === null || !loggedInUser || !nostrClient)
      return

    const selectedConversation = conversations[selectedConversationIndex]

    const newMessage = DirectMessage.create(
      loggedInUser,
      Array.from(selectedConversation.participants),
      content,
      selectedConversation.subject
    )

    const directMessageService = new DirectMessageService(nostrClient)
    new SendDirectMessage(directMessageService).execute(newMessage).match(
      () => {},
      (error) => {
        console.error('Failed to send message:', error)
      }
    )
  }

  const handleCreateChat = (
    chatName: string,
    participantsPubkeys: string[]
  ) => {
    if (!loggedInUser || !nostrClient) return

    const conversationId = Conversation.generateId(
      [loggedInUser.pubkey, ...participantsPubkeys],
      chatName
    )
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
        const participants = new Set(users.map((user) => new Participant(user)))
        return Conversation.create(participants, chatName)
      })
      .match(
        (newConversation) => {
          setConversations((prevConversations) => [
            ...prevConversations,
            newConversation,
          ])
        },
        (error) => {
          console.error('Failed to create chat:', error)
        }
      )
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
      <MessageCreateChatModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateChat={handleCreateChat}
      />
    </div>
  )
}

export default MessagePage
