import React, { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import { CSSTransition } from 'react-transition-group'
import replyData from '../../data/dummy-reply-data'
import meImage from '../../assets/images/example/me.png'
import PostItem from '../PostItem/PostItem'
import { PostItemType } from '../../global/types'
import './RepliesThreadModal.css'

interface RepliesThreadModalProps {
  originalPost: PostItemType
  onClose: () => void
  showModal: boolean
}

const RepliesThreadModal: React.FC<RepliesThreadModalProps> = ({
  originalPost,
  onClose,
  showModal,
}) => {
  const [newReply, setNewReply] = useState('')

  const frameRef = React.useRef<HTMLDivElement>(null)

  const handleNewReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReply(e.target.value)
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

  const handleClickContent = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }
  const handleClose = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    onClose()
  }

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleClose}
        ></div>
      )}
      <CSSTransition
        in={showModal}
        timeout={300}
        classNames="modal"
        unmountOnExit
      >
        <div
          className="fixed inset-0 flex items-end justify-center z-50"
          onClick={handleClose}
        >
          <div
            ref={frameRef}
            className="bg-gray-50 dark:bg-gray-900 rounded-t-lg w-full max-w-md mx-2 p-4 h-4/5 overflow-y-auto"
            onClick={handleClickContent}
          >
            <div className="mb-6">
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
            </div>

            <div className="mb-6">
              <textarea
                className="w-full p-2 border border-gray-300 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <hr className="border-gray-200 dark:border-gray-800 mb-4" />

            <div className="text-gray-700 dark:text-gray-300">
              {replyData.map((reply, index) => (
                <div key={index} className="mb-4">
                  <PostItem
                    userId={reply.userId}
                    userName={reply.userName}
                    verified={reply.verified}
                    content={reply.content}
                    replies={reply.replies}
                    likes={reply.likes}
                    reposts={reply.reposts}
                    zaps={reply.zaps}
                    userImage={reply.userImage}
                    timestamp={reply.timestamp}
                    following={reply.following}
                    onToggleFollow={() => {
                      console.log('not implemented')
                      return true
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CSSTransition>
    </>
  )
}

export default RepliesThreadModal
