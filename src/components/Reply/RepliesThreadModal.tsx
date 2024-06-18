import React, { useState, useEffect } from 'react'
import { useSpring, animated } from 'react-spring'
import { useDrag } from 'react-use-gesture'
import { FiMessageCircle } from 'react-icons/fi'
import replyData from '@/data/dummy-reply-data'
import NoteItem from '@/components/NoteItem/NoteItem'
import { createDummyNewReply } from '@/utils/mock'
import './RepliesThreadModal.css'
import { NoteType } from '@/domain/entities/Note'

interface RepliesThreadModalProps {
  originalNote: NoteType
  showModal: boolean
  onClose: () => void
  onToggleFollow: (userId: string) => boolean
}

const frameHeight = (window.innerHeight * 4) / 5

const RepliesThreadModal: React.FC<RepliesThreadModalProps> = ({
  originalNote,
  onClose,
  showModal,
  onToggleFollow,
}) => {
  const [newReply, setNewReply] = useState('')

  const handleNewReplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewReply(e.target.value)
  }

  const handleNewReplySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newReply.trim()) {
      replyData.push(createDummyNewReply(newReply))
      setNewReply('')
    }
  }

  const handleReplyToReply = (userId: string) => {
    setNewReply(`@${userId} `)
  }

  const handleClickFrame = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  const handleClose = () => {
    api.start({
      y: frameHeight,
      config: { duration: 200 },
      onRest: onClose,
    })
  }

  const [{ y }, api] = useSpring(() => ({
    y: 0,
    config: { tension: 300, friction: 30 },
  }))

  const bind = useDrag(
    ({ down, movement: [, my], memo = y.get(), event }) => {
      if (down) {
        api.start({
          y: my > 0 ? my : 0,
          immediate: true,
        })
      } else if (my > 100) {
        api.start({
          y: frameHeight,
          config: { duration: 200 },
          onRest: onClose,
        })
      } else {
        api.start({ y: 0, config: { tension: 300, friction: 30 } })
      }

      return memo
    },
    { from: () => [0, y.get()], bounds: { top: 0 }, filterTaps: true }
  )

  useEffect(() => {
    if (showModal) {
      api.start({ y: 0 })
    } else {
      api.start({ y: frameHeight })
    }
  }, [showModal, api])

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
            className="bg-gray-50 dark:bg-gray-900 rounded-t-lg w-full max-w-md h-4/5 flex flex-col"
            onClick={handleClickFrame}
            {...bind()}
          >
            <div className="overflow-y-auto p-4 flex-grow">
              <div className="mb-6">
                <NoteItem
                  note={{
                    ...originalNote,
                    media: undefined,
                  }}
                  onToggleFollow={onToggleFollow}
                  onReply={handleReplyToReply}
                />
              </div>

              <hr className="border-gray-200 dark:border-gray-800 mb-4" />

              <div className="text-gray-700 dark:text-gray-300">
                {replyData.map((reply, index) => (
                  <div key={index} className="mb-4">
                    <NoteItem
                      note={reply}
                      onToggleFollow={onToggleFollow}
                      onReply={handleReplyToReply}
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
                className="ml-2 p-2 bg-blue-500 active:bg-blue-600 dark:bg-blue-600 active:dark:bg-blue-700 text-white rounded"
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
