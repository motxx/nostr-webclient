import React, { useEffect, useMemo, useRef } from 'react'
import { AiOutlineThunderbolt } from 'react-icons/ai'
import { FiHeart, FiMessageCircle, FiRepeat } from 'react-icons/fi'
import { PostActionType } from './NoteItem'
import { useNostrClient } from '@/hooks/useNostrClient'

interface PostActionsProps {
  repliesCount: number
  repostsCount: number
  likesCount: number
  zapsAmount: number
  onClickAction: (id: PostActionType) => void
}

const NoteItemActions: React.FC<PostActionsProps> = ({
  repliesCount,
  repostsCount,
  likesCount,
  zapsAmount,
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
        {repliesCount > 0 && (
          <span className="text-xs group-hover:text-blue-500 transition">
            {repliesCount}
          </span>
        )}
      </div>
      <div
        className="flex items-center space-x-1 cursor-pointer group"
        onClick={() => onClickAction('repost')}
      >
        <FiRepeat className="text-xl group-hover:text-green-500 transition" />
        {repostsCount > 0 && (
          <span className="text-xs group-hover:text-green-500 transition">
            {repostsCount}
          </span>
        )}
      </div>
      <div
        className="flex items-center space-x-1 cursor-pointer group"
        onClick={() => onClickAction('like')}
      >
        <FiHeart className="text-xl group-hover:text-red-500 transition" />
        {likesCount > 0 && (
          <span className="text-xs group-hover:text-red-500 transition">
            {likesCount}
          </span>
        )}
      </div>
      <div
        className="flex items-center space-x-1 cursor-pointer group"
        onClick={() => onClickAction('zap')}
      >
        <AiOutlineThunderbolt className="text-xl group-hover:text-yellow-500 transition" />
        {zapsAmount > 0 && (
          <span className="text-xs group-hover:text-yellow-500 transition">
            {zapsAmount}
          </span>
        )}
      </div>
    </div>
  )
}

export default NoteItemActions
