import React, { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import replyData from '../../data/dummy-reply-data'
import meImage from '../../assets/images/example/me.png'
import PostItem from '../PostItem/PostItem'
import { PostItemType } from '../../global/types'

interface RepliesThreadProps {
  originalPost: PostItemType
  onToggleFollow: (userId: string) => boolean
}

const RepliesThread: React.FC<RepliesThreadProps> = ({
  originalPost,
  onToggleFollow,
}) => {
  const [newReply, setNewReply] = useState('')

  const handleNewReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReply(e.target.value)
  }

  const handleReplyToReply = (userId: string) => {
    setNewReply(`@${userId} `)
  }

  const handleNewReplySubmit = () => {
    if (newReply.trim()) {
      replyData.push({
        id: '109',
        userName: 'moti',
        content: newReply,
        userImage: meImage,
        timestamp: 'just now',
        userId: 'riel.pages.dev',
        verified: false,
        replies: 0,
        likes: 0,
        reposts: 0,
        zaps: 0,
        following: true,
      })
      setNewReply('')
    }
  }

  return (
    <div className="h-full p-4 overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-700 border-l">
      <div className="mb-6">
        <PostItem
          post={{
            ...originalPost,
            mediaType: undefined,
            mediaUrl: undefined,
          }}
          onToggleFollow={onToggleFollow}
          onReply={handleReplyToReply}
        />
      </div>

      <div className="mb-6">
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
          placeholder="リプライを入力..."
          value={newReply}
          onChange={handleNewReplyChange}
        />
        <button
          className="mt-2 flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={handleNewReplySubmit}
        >
          <FiSend className="mr-2" />
          返信
        </button>
      </div>

      <div className="text-gray-700 dark:text-gray-300">
        {replyData.map((reply, index) => (
          <div key={index} className="mb-4">
            <PostItem
              post={reply}
              onToggleFollow={onToggleFollow}
              onReply={handleReplyToReply}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RepliesThread
