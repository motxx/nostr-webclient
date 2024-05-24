import React, { useState, useEffect, useRef } from 'react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { FiMessageCircle } from 'react-icons/fi'
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

  const frameRef = useRef<HTMLDivElement>(null)

  const handleNewReplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewReply(e.target.value)
  }

  const handleNewReplySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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

  const handleClose = () => {
    api.start({
      y: (window.innerHeight * 4) / 5,
      config: { duration: 200 },
      onRest: onClose,
    })
  }

  const [{ y }, api] = useSpring(() => ({
    y: 0,
    config: { tension: 300, friction: 30 },
  }))

  const bind = useDrag(
    ({ down, movement: [, my], direction: [, dy], cancel }) => {
      if (down) {
        api.start({
          y: my > 0 ? my : 0,
          config: { tension: 300, friction: 30 },
        })
      } else if (my > 100) {
        api.start({
          y: (window.innerHeight * 4) / 5,
          config: { duration: 200 },
          onRest: onClose,
        })
      } else {
        api.start({ y: 0, config: { tension: 300, friction: 30 } })
      }
    },
    { from: () => [0, y.get()], bounds: { top: 0 }, filterTaps: true }
  )

  useEffect(() => {
    if (showModal) {
      api.start({ y: 0 })
    } else {
      api.start({ y: (window.innerHeight * 4) / 5 })
    }
  }, [showModal, api])

  useEffect(() => {
    const preventScroll = (e: TouchEvent) => {
      if (frameRef.current && frameRef.current.contains(e.target as Node)) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      document.removeEventListener('touchmove', preventScroll)
    }
  }, [])

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={handleClose}
        ></div>
      )}
      {showModal && (
        <animated.div
          className="fixed inset-0 flex items-end justify-center z-50"
          onClick={handleClose}
          style={{ y }}
        >
          <animated.div
            ref={frameRef}
            className="bg-gray-50 dark:bg-gray-900 rounded-t-lg w-full max-w-md h-4/5 flex flex-col"
            onClick={handleClickContent}
            {...bind()}
          >
            <div className="overflow-y-auto p-4 flex-grow">
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
            <form
              onSubmit={handleNewReplySubmit}
              className="p-4 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex items-center"
            >
              <input
                className="w-full p-2 border border-gray-300 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="リプライを入力..."
                value={newReply}
                onChange={handleNewReplyChange}
              />
              <button
                type="submit"
                className="ml-2 p-2 bg-blue-500 active:bg-blue-600 rounded"
              >
                <FiMessageCircle size={24} />
              </button>
            </form>
          </animated.div>
        </animated.div>
      )}
    </>
  )
}

export default RepliesThreadModal
