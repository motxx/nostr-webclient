import React, { useState } from 'react'
import PrimaryButton from '../common/PrimaryButton'
import { IoMdPersonAdd } from 'react-icons/io'
import { LuMessageSquarePlus } from 'react-icons/lu'

interface MessageCreateChatModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateChat: (chatName: string, participants: string[]) => void
}

const MessageCreateChatModal: React.FC<MessageCreateChatModalProps> = ({
  isOpen,
  onClose,
  onCreateChat,
}) => {
  const [chatName, setChatName] = useState('')
  const [participants, setParticipants] = useState<string[]>([])
  const [participantInput, setParticipantInput] = useState('')

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleAddParticipant = () => {
    if (participantInput.trim() && !participants.includes(participantInput)) {
      setParticipants([...participants, participantInput])
      setParticipantInput('')
    }
  }

  const handleCreateChat = () => {
    if (chatName.trim()) {
      onCreateChat(chatName, participants)
      setChatName('')
      setParticipants([])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25"
      onClick={handleBackgroundClick}
    >
      <div className="bg-gray-200 dark:bg-gray-800 px-8 py-6 rounded-md shadow-md w-80">
        <h2 className="text-lg font-bold mb-4">新しいチャットを作成</h2>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent mb-4"
          placeholder="チャット名を入力..."
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
        />
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2">参加者を追加</h3>
          <div className="flex items-center">
            <input
              type="text"
              className="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent mr-2"
              placeholder="ユーザー名を入力..."
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
            />
            <button onClick={handleAddParticipant}>
              <IoMdPersonAdd className="text-2xl text-white bg-blue-500 rounded-md p-2 h-10 w-10" />
            </button>
          </div>
          <ul className="mt-2">
            {participants.map((participant, index) => (
              <li
                key={index}
                className="text-gray-700 dark:text-gray-300 text-sm"
              >
                {participant}
              </li>
            ))}
          </ul>
        </div>
        <PrimaryButton
          className="w-full mt-2 px-4 py-2 rounded-md"
          onClick={handleCreateChat}
        >
          <LuMessageSquarePlus className="mt-1 mr-2 text-2xl" />
          作成
        </PrimaryButton>
      </div>
    </div>
  )
}

export default MessageCreateChatModal
