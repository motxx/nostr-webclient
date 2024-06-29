import React, { useRef } from 'react'
import { AiOutlineThunderbolt } from 'react-icons/ai'
import { FiHeart, FiMessageCircle, FiRepeat } from 'react-icons/fi'
import { PostActionType } from '@/domain/entities/Note'
import { emojify } from 'node-emoji'

interface PostActionsProps {
  repliesCount: number
  repostsCount: number
  likesCount: number
  zapsAmount: number
  customReactions?: { [key: string]: number }
  onClickAction: (id: PostActionType) => void
}

const NoteItemActions: React.FC<PostActionsProps> = ({
  repliesCount,
  repostsCount,
  likesCount,
  zapsAmount,
  customReactions,
  onClickAction,
}) => {
  const actionsRef = useRef<HTMLDivElement>(null)

  const renderCustomReactions = () => {
    if (!customReactions) return null

    return (
      <div className="flex flex-wrap gap-2 mb-2">
        {Object.entries(customReactions).map(([reaction, count]) => (
          <button
            key={reaction}
            className="flex items-center space-x-1 cursor-pointer group bg-gray-200 dark:bg-gray-700 rounded-full px-2 py-1 text-sm transition-colors hover:bg-gray-300 dark:hover:bg-gray-600"
            onClick={() => onClickAction(reaction)}
          >
            <span className="text-base">{emojify(reaction)}</span>
            {count > 0 && <span className="text-xs">{count}</span>}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="font-noto-sans" ref={actionsRef}>
      {renderCustomReactions()}
      <div className="flex space-x-4 text-gray-500 dark:text-gray-400">
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
    </div>
  )
}

export default NoteItemActions
