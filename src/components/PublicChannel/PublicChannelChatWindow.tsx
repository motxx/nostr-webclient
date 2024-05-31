import React, { useState, useEffect, useRef, FormEvent } from 'react'
import { useAtom } from 'jotai'
import { publicChannelScrollPositionAtom } from '../../state/atoms'
import PublicChannelChatMessage from './PublicChannelChatMessage'
import { mockMessages } from '../../data/dummy-mock-messages'
import { PublicChannelType } from '../../global/types'
import { IoMdSend } from 'react-icons/io'

interface PublicChannelChatWindowProps {
  channel: PublicChannelType
  onOpenSidebar: () => void
}

const PublicChannelChatWindow: React.FC<PublicChannelChatWindowProps> = ({
  channel,
  onOpenSidebar,
}) => {
  const [messages, setMessages] = useState(mockMessages)
  const [newMessage, setNewMessage] = useState<string>('')
  const chatWindowRef = useRef<HTMLDivElement>(null)
  const [scrollPositions, setScrollPositions] = useAtom(
    publicChannelScrollPositionAtom
  )

  useEffect(() => {
    setMessages(mockMessages)
  }, [])

  useEffect(() => {
    if (chatWindowRef.current) {
      const savedScrollPosition = scrollPositions[channel.id]
      chatWindowRef.current.scrollTop = savedScrollPosition ?? 0
    }
  }, [channel, scrollPositions])

  useEffect(() => {
    const handleScroll = () => {
      if (channel && chatWindowRef.current) {
        setScrollPositions((prev) => ({
          ...prev,
          [channel.id]: chatWindowRef.current!.scrollTop,
        }))
      }
    }

    const chatWindow = chatWindowRef.current
    chatWindow?.addEventListener('scroll', handleScroll)

    return () => {
      chatWindow?.removeEventListener('scroll', handleScroll)
    }
  }, [channel, setScrollPositions])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault() // フォームのデフォルトの動作をキャンセル
    if (newMessage.trim() !== '') {
      const newMsg = {
        id: String(messages.length + 1),
        user: {
          name: 'CurrentUser',
          avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        },
        content: newMessage,
        timestamp: new Date().toLocaleString(),
      }
      setMessages([...messages, newMsg])
      setNewMessage('')
      if (chatWindowRef.current) {
        chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
      }
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString()
  }

  const isNewDay = (currentMessage: any, previousMessage: any) => {
    const currentDate = formatDate(currentMessage.timestamp)
    const previousDate = previousMessage
      ? formatDate(previousMessage.timestamp)
      : null
    return currentDate !== previousDate
  }

  return (
    <div className="w-full flex flex-col h-full relative">
      <div className="flex-grow overflow-auto" ref={chatWindowRef}>
        <div className="z-10 flex sticky top-0 w-full bg-white dark:bg-black">
          <button
            onClick={onOpenSidebar}
            className="md:hidden w-8 h-12 px-4 font-bold"
          >
            ←
          </button>
          <h2 className="text-lg font-bold mb-4 px-2 md:px-4 pt-8 pb-4 h-12 flex items-center">
            {channel ? `# ${channel.name}` : 'Select a channel'}
          </h2>
        </div>
        {channel && (
          <div className="p-4">
            {messages.map((message, index) => (
              <React.Fragment key={message.id}>
                {isNewDay(message, messages[index - 1]) && (
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative text-center">
                      <span className="px-2 bg-white dark:bg-black text-gray-500 text-sm font-bold">
                        {formatDate(message.timestamp)}
                      </span>
                    </div>
                  </div>
                )}
                <PublicChannelChatMessage message={message} />
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      {channel && (
        <div className="sticky bottom-0 mb-20 sm:mb-0 p-2 sm:px-4 sm:border-t border-gray-200 dark:border-gray-700">
          <form className="flex" onSubmit={handleSubmit}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-grow rounded-full px-4 sm:px-0 sm:rounded-none outline-none w-full bg-gray-300 dark:bg-gray-800 sm:bg-transparent sm:dark:bg-transparent text-gray-700 dark:text-gray-300"
              placeholder="Type your message"
            />
            <button
              type="submit"
              className="ml-1 p-2 flex justify-center items-center bg-blue-500 dark:bg-gray-800 text-white rounded-full sm:rounded"
            >
              <IoMdSend className="text-xl" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default PublicChannelChatWindow
