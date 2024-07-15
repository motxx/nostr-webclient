import React, { useState, useRef, useMemo } from 'react'
import { useAtom } from 'jotai'
import { publicChatScrollPositionAtom } from '@/state/atoms'
import { PublicChannel } from '@/domain/entities/PublicChat'
import { PublicChatMessageWindowHeader } from './PublicChatMessageWindowHeader'
import { PublicChatMessageList } from './PublicChatMessageList'
import { PublicChatMessageInput } from './PublicChatMessageInput'
import { usePublicChatMessages } from '../hooks/usePublicChatMessages'
import { useScrollPosition } from '../hooks/useScrollPosition'
import { useMessageSubmission } from '../hooks/useMessageSubmission'
import { useDateFormatting } from '../hooks/useDateFormatting'

interface PublicChatMessageWindowProps {
  channel: PublicChannel
  onOpenSidebar: () => void
}

const PublicChatMessageWindow: React.FC<PublicChatMessageWindowProps> = ({
  channel,
  onOpenSidebar,
}) => {
  const [newMessage, setNewMessage] = useState<string>('')
  const messageWindowRef = useRef<HTMLDivElement>(null)
  const [scrollPositions, setScrollPositions] = useAtom(
    publicChatScrollPositionAtom
  )

  const { messages } = usePublicChatMessages(channel.id)
  useScrollPosition(
    messageWindowRef,
    channel.id,
    scrollPositions,
    setScrollPositions
  )
  const { handleSubmit } = useMessageSubmission(
    channel.id,
    newMessage,
    setNewMessage
  )
  const { formatDate, isNewDay } = useDateFormatting()

  const backgroundStyle = useMemo(
    () =>
      channel.picture ? { backgroundImage: `url(${channel.picture})` } : {},
    [channel.picture]
  )

  return (
    <div
      className="w-full flex flex-col h-full relative bg-cover bg-center bg-no-repeat"
      style={backgroundStyle}
    >
      <div className="absolute inset-0 bg-white/80 dark:bg-black/80 pointer-events-none" />
      <PublicChatMessageWindowHeader
        channel={channel}
        onOpenSidebar={onOpenSidebar}
      />
      <PublicChatMessageList
        messages={messages}
        isNewDay={isNewDay}
        formatDate={formatDate}
        messageWindowRef={messageWindowRef}
      />
      <PublicChatMessageInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSubmit={handleSubmit}
      />
    </div>
  )
}

export default PublicChatMessageWindow
