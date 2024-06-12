import React from 'react'
import NoteDetailsMediaContent from './NoteDetailsMediaContent'
import NoteDetailsActions from './NoteDetailsActions'
import RepliesThread from '@/components/Reply/RepliesThread'
import { PostActionType } from '@/components/NoteItem/NoteItem'
import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi'
import { NoteType } from '@/domain/entities/Note'

interface NoteDetailsProps {
  isOpen: boolean
  onClose: () => void
  originalNote: NoteType
  onClickAction: (type: PostActionType) => void
  onToggleFollow: (userId: string) => boolean
  onClickPrevPost?: () => void
  onClickNextPost?: () => void
}

const NoteDetails: React.FC<NoteDetailsProps> = ({
  isOpen,
  onClose,
  originalNote,
  onClickAction,
  onToggleFollow,
  onClickPrevPost,
  onClickNextPost,
}) => {
  if (!isOpen) return null

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20 dark:bg-opacity-90"
      onClick={handleBackgroundClick}
    >
      <div
        className="z-40 absolute top-2 left-2 w-10 h-10 flex items-center justify-center text-white text-xl rounded-full hover:bg-gray-500 cursor-pointer hover:bg-opacity-25"
        onClick={handleBackgroundClick}
      >
        ✕
      </div>
      <div className="relative w-full h-full flex overflow-hidden">
        {onClickPrevPost && (
          <div
            className="absolute left-0 w-12 h-12 rounded-full top-1/2 -translate-y-1/2 sm:w-[6%] sm:min-w-[60px] sm:h-full sm:rounded-none sm:top-0 sm:translate-y-0 flex items-center justify-center text-gray-500 hover:text-gray-300 text-xl hover:bg-gray-500 cursor-pointer hover:bg-opacity-25 z-20"
            onClick={onClickPrevPost}
          >
            <PiCaretLeftBold />
          </div>
        )}
        <div
          className="relative flex-1 h-full z-10"
          onClick={handleBackgroundClick}
        >
          {originalNote.mediaTypes && (
            <NoteDetailsMediaContent
              note={originalNote}
              onBackgroundClick={handleBackgroundClick}
            />
          )}
        </div>
        <div
          className="absolute bottom-0 w-full z-30"
          onClick={handleBackgroundClick}
        >
          <NoteDetailsActions
            originalNote={originalNote}
            onBackgroundClick={handleBackgroundClick}
            onClickAction={onClickAction}
            onToggleFollow={onToggleFollow}
          />
        </div>
        {onClickNextPost && (
          <div
            className="absolute right-0 w-12 h-12 rounded-full top-1/2 -translate-y-1/2 sm:w-[6%] sm:min-w-[60px] sm:h-full sm:rounded-none sm:top-0 sm:translate-y-0 flex items-center justify-center text-gray-500 hover:text-gray-300 text-xl hover:bg-gray-500 cursor-pointer hover:bg-opacity-25 z-20"
            onClick={onClickNextPost}
          >
            <PiCaretRightBold />
          </div>
        )}
      </div>
      <div className="hidden md:block w-[35%] h-full z-10 overflow-y-auto">
        <RepliesThread
          originalNote={originalNote}
          onToggleFollow={onToggleFollow}
        />
      </div>
    </div>
  )
}

export default NoteDetails
