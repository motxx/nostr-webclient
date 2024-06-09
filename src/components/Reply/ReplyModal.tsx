import React, { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { NoteItemType } from '@/global/types'
import NoteItem from '@/components/NoteItem/NoteItem'
import PrimaryButton from '@/components/ui-parts/PrimaryButton'

interface ReplyModalProps {
  originalNote: NoteItemType
  isOpen: boolean
  onClose: () => void
  onSubmit: (replyContent: string) => void
  onToggleFollow: (userId: string) => boolean
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  originalNote,
  onSubmit,
  onToggleFollow,
}) => {
  const [replyContent, setReplyContent] = useState('')

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleSubmit = () => {
    if (replyContent.trim()) {
      onSubmit(replyContent)
      setReplyContent('')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white dark:bg-black p-4 rounded-md shadow-md w-80">
        <NoteItem
          post={{
            ...originalNote,
            mediaType: undefined,
            mediaUrl: undefined,
          }}
          onToggleFollow={onToggleFollow}
        />
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent mt-4"
          placeholder="リプライを入力..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
        />
        <PrimaryButton
          className="mt-2 px-4 py-2 rounded-md"
          onClick={handleSubmit}
        >
          <FiSend className="mr-2" />
          返信
        </PrimaryButton>
      </div>
    </div>
  )
}

export default ReplyModal
