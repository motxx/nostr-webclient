import React, { useEffect, useMemo, useRef } from 'react'
import { AiOutlineThunderbolt } from 'react-icons/ai'
import { FiHeart, FiMessageCircle, FiRepeat } from 'react-icons/fi'
import { PostActionType } from './NoteItem'
import { useNostrClient } from '@/hooks/useNostrClient'

interface PostActionsProps {
  replies: number
  reposts: number
  likes: number
  zaps: number
  onClickAction: (id: PostActionType) => void
}

const NoteItemActions: React.FC<PostActionsProps> = ({
  replies,
  reposts,
  likes,
  zaps,
  onClickAction,
}) => {
  const nostrClient = useNostrClient()
  const actionsRef = useRef<HTMLDivElement>(null)
  const observer = useMemo(
    () =>
      new IntersectionObserver(async ([entry]) => {
        if (entry.isIntersecting && actionsRef.current && nostrClient) {
          // TODO: fetch reactions count
        }
      }),
    [nostrClient]
  )

  useEffect(() => {
    const ref = actionsRef.current
    if (ref) observer.observe(ref)

    return () => {
      if (ref) observer.unobserve(ref)
    }
  }, [observer])

  return (
    <div
      className="flex space-x-4 text-gray-500 dark:text-gray-400 font-noto-sans"
      ref={actionsRef}
    >
      <div
        className="flex items-center space-x-1 cursor-pointer group"
        onClick={() => onClickAction('reply')}
      >
        <FiMessageCircle className="text-xl group-hover:text-blue-500 transition" />
        {replies > 0 && (
          <span className="text-xs group-hover:text-blue-500 transition">
            {replies}
          </span>
        )}
      </div>
      <div
        className="flex items-center space-x-1 cursor-pointer group"
        onClick={() => onClickAction('repost')}
      >
        <FiRepeat className="text-xl group-hover:text-green-500 transition" />
        {reposts > 0 && (
          <span className="text-xs group-hover:text-green-500 transition">
            {reposts}
          </span>
        )}
      </div>
      <div
        className="flex items-center space-x-1 cursor-pointer group"
        onClick={() => onClickAction('like')}
      >
        <FiHeart className="text-xl group-hover:text-red-500 transition" />
        {likes > 0 && (
          <span className="text-xs group-hover:text-red-500 transition">
            {likes}
          </span>
        )}
      </div>
      <div
        className="flex items-center space-x-1 cursor-pointer group"
        onClick={() => onClickAction('zap')}
      >
        <AiOutlineThunderbolt className="text-xl group-hover:text-yellow-500 transition" />
        {zaps > 0 && (
          <span className="text-xs group-hover:text-yellow-500 transition">
            {zaps}
          </span>
        )}
      </div>
    </div>
  )
}

export default NoteItemActions
