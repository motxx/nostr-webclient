import React, { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { PostItemType } from '../../global/types'
import PostItem from '../PostItem/PostItem'

interface ReplyModalProps {
  isOpen: boolean
  onClose: () => void
  originalPost: PostItemType
  onSubmit: (replyContent: string) => void
}

const ReplyModal: React.FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  originalPost,
  onSubmit,
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
        <PostItem
          userId={originalPost.userId}
          userName={originalPost.userName}
          verified={originalPost.verified}
          content={originalPost.content}
          replies={originalPost.replies}
          likes={originalPost.likes}
          reposts={originalPost.reposts}
          zaps={originalPost.zaps}
          userImage={originalPost.userImage}
          timestamp={originalPost.timestamp}
          following={originalPost.following}
          onToggleFollow={() => {
            console.log('not implemented')
            return true
          }}
        />
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent mt-4"
          placeholder="返信内容を入力..."
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
        />
        <button
          className="mt-2 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleSubmit}
        >
          <FiSend className="mr-2" />
          返信
        </button>
      </div>
    </div>
  )
}

export default ReplyModal
