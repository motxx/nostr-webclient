import React, { useState } from 'react'
import { FiSend, FiImage } from 'react-icons/fi'
import PrimaryButton from '@/components/ui-parts/PrimaryButton'

interface PostNoteModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (noteContent: string, media?: File) => void
}

const PostNoteModal: React.FC<PostNoteModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [noteContent, setNoteContent] = useState('')
  const [media, setMedia] = useState<File | null>(null)

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleSubmit = () => {
    if (noteContent.trim()) {
      onSubmit(noteContent, media || undefined)
      setNoteContent('')
      setMedia(null)
      onClose()
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setMedia(event.target.files[0])
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleBackgroundClick}
    >
      <div className="bg-white dark:bg-black p-4 rounded-md shadow-md w-80">
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
          placeholder="新しいノートを入力..."
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          rows={4}
        />
        <div className="flex justify-between items-center mt-2">
          <label className="cursor-pointer">
            <FiImage className="text-blue-500" />
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          {media && <span className="text-sm text-gray-500">{media.name}</span>}
          <PrimaryButton
            className="px-4 py-2 rounded-md"
            onClick={handleSubmit}
          >
            <FiSend className="mr-2" />
            投稿
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

export default PostNoteModal
