import React, { useState } from 'react'
import { FiHeart, FiMessageCircle, FiRepeat } from 'react-icons/fi'
import { AiOutlineThunderbolt } from 'react-icons/ai'
import { PostActionType } from '@/components/NoteItem/NoteItem'
import ReplyModal from '@/components/Reply/ReplyModal'
import RepliesThreadModal from '@/components/Reply/RepliesThreadModal'
import { NoteType } from '@/domain/entities/Note'

interface NoteDetailsActionsProps {
  originalNote: NoteType
  onBackgroundClick?: (event: React.MouseEvent<HTMLDivElement>) => void
  onClickAction: (type: PostActionType) => void
  onToggleFollow: (userId: string) => boolean
}

const NoteDetails: React.FC<NoteDetailsActionsProps> = ({
  onBackgroundClick,
  onClickAction,
  originalNote,
  onToggleFollow,
}) => {
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false)
  const [isRepliesThreadModalOpen, setIsRepliesThreadModalOpen] =
    useState(false)

  const handleActionClick = (
    e: React.MouseEvent<HTMLDivElement>,
    type: PostActionType
  ) => {
    e.stopPropagation()
    if (type === 'reply') {
      if (window.matchMedia('(max-width: 768px)').matches) {
        setIsRepliesThreadModalOpen(true)
      } else {
        setIsReplyModalOpen(true)
      }
    } else {
      onClickAction(type)
    }
  }

  const handleReplySubmit = (replyContent: string) => {
    console.log('New reply content:', replyContent)
    // ここで返信の処理を実装します。
  }

  return (
    <div
      className="absolute bottom-0 pb-8 sm:pb-0 w-full bg-black bg-opacity-10 dark:bg-opacity-50"
      onClick={onBackgroundClick}
    >
      <div
        className="flex justify-around items-center text-white h-[62px]"
        onClick={onBackgroundClick}
      >
        <div
          className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20"
          onClick={(e) => handleActionClick(e, 'reply')}
        >
          <FiMessageCircle className="text-2xl group-hover:text-blue-500 transition" />
          {originalNote.replyChildNotes &&
            originalNote.replyChildNotes.length > 0 && (
              <span className="text-sm group-hover:text-blue-500 transition">
                {originalNote.replyChildNotes.length}
              </span>
            )}
        </div>
        <div
          className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20"
          onClick={(e) => handleActionClick(e, 'repost')}
        >
          <FiRepeat className="text-2xl group-hover:text-green-500 transition" />
          {originalNote.reactions.repostsCount > 0 && (
            <span className="text-sm group-hover:text-green-500 transition">
              {originalNote.reactions.repostsCount}
            </span>
          )}
        </div>
        <div
          className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20"
          onClick={(e) => handleActionClick(e, 'like')}
        >
          <FiHeart className="text-2xl group-hover:text-red-500 transition" />
          {originalNote.reactions.likesCount > 0 && (
            <span className="text-sm group-hover:text-red-500 transition">
              {originalNote.reactions.likesCount}
            </span>
          )}
        </div>
        <div
          className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20"
          onClick={(e) => handleActionClick(e, 'zap')}
        >
          <AiOutlineThunderbolt className="text-2xl group-hover:text-yellow-500 transition" />
          {originalNote.reactions.zapsAmount > 0 && (
            <span className="text-sm group-hover:text-yellow-500 transition">
              {originalNote.reactions.zapsAmount}
            </span>
          )}
        </div>
      </div>
      <ReplyModal
        originalNote={originalNote}
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        onSubmit={handleReplySubmit}
        onToggleFollow={onToggleFollow}
      />
      <RepliesThreadModal
        originalNote={originalNote}
        onClose={() => setIsRepliesThreadModalOpen(false)}
        showModal={isRepliesThreadModalOpen}
        onToggleFollow={onToggleFollow}
      />
    </div>
  )
}

export default NoteDetails
