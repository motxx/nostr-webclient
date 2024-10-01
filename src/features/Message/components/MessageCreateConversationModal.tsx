import React, { useState } from 'react'
import { IoMdPersonAdd } from 'react-icons/io'
import { LuMessageSquarePlus } from 'react-icons/lu'
import Button from '@/components/ui-elements/Button'
import Input from '@/components/ui-elements/Input'
import PrimaryButton from '@/components/ui-parts/PrimaryButton'

interface MessageCreateConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateConversation: (
    chatName: string,
    otherPartcipantPubkeys: string[]
  ) => void
}

const MessageCreateConversationModal: React.FC<
  MessageCreateConversationModalProps
> = ({ isOpen, onClose, onCreateConversation }) => {
  const [chatName, setChatName] = useState('')
  const [otherParticipantPubkeys, setOtherParticipantPubkeys] = useState<
    string[]
  >([])
  const [otherParticipantInput, setOtherParticipantInput] = useState('')

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleAddParticipant = () => {
    if (
      otherParticipantInput.trim() &&
      !otherParticipantPubkeys.includes(otherParticipantInput)
    ) {
      setOtherParticipantPubkeys([
        ...otherParticipantPubkeys,
        otherParticipantInput,
      ])
      setOtherParticipantInput('')
    }
  }

  const handleCreateConversation = () => {
    if (chatName.trim()) {
      onCreateConversation(chatName, otherParticipantPubkeys)
      setChatName('')
      setOtherParticipantPubkeys([])
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-25"
      onClick={handleBackgroundClick}
    >
      <div className="bg-gray-200 dark:bg-gray-800 px-8 py-6 rounded-md shadow-md">
        <h2 className="text-lg font-bold mb-4">新しいチャットを作成</h2>
        <Input
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          placeholder="チャット名を入力..."
          className="w-full mb-4 bg-transparent border"
        />
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2">参加者を追加</h3>
          <div className="flex items-center gap-x-2">
            <Input
              value={otherParticipantInput}
              onChange={(e) => setOtherParticipantInput(e.target.value)}
              placeholder="ユーザーのpubkeyを入力..."
              className="flex-grow bg-transparent border"
            />
            <Button
              onClick={handleAddParticipant}
              className="text-2xl text-white bg-blue-500 rounded-md p-2 h-10 w-10"
            >
              <IoMdPersonAdd />
            </Button>
          </div>
          <ul className="mt-2">
            {otherParticipantPubkeys.map((pubkey, index) => (
              <li
                key={index}
                className="text-gray-700 dark:text-gray-300 text-sm"
              >
                {pubkey}
              </li>
            ))}
          </ul>
        </div>
        <PrimaryButton
          className="w-full mt-2 px-4 py-2 rounded-md"
          onClick={handleCreateConversation}
        >
          <LuMessageSquarePlus className="mt-1 mr-2 text-2xl" />
          作成
        </PrimaryButton>
      </div>
    </div>
  )
}

export default MessageCreateConversationModal
