import React from 'react'
import PostDetailsMediaContent from './PostDetailsMediaContent'
import PostDetailsActions from './PostDetailsActions'
import RepliesThread from '../Reply/RepliesThread'
import { PostItemType } from '../../global/types'
import { PostActionType } from '../PostItem/PostItem'
import { PiCaretLeftBold, PiCaretRightBold } from 'react-icons/pi'

interface PostDetailsProps {
  isOpen: boolean
  onClose: () => void
  originalPost: PostItemType
  onClickAction: (type: PostActionType) => void
  onToggleFollow: (userId: string) => boolean
  onClickPrevPost?: () => void
  onClickNextPost?: () => void
}

const PostDetails: React.FC<PostDetailsProps> = ({
  isOpen,
  onClose,
  originalPost,
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={handleBackgroundClick}
    >
      <div
        className="z-10 absolute top-2 left-2 w-10 h-10 flex items-center justify-center text-white text-xl rounded-full hover:bg-gray-500 cursor-pointer hover:bg-opacity-25"
        onClick={handleBackgroundClick}
      >
        ✕
      </div>
      <div className="relative w-full h-full flex overflow-hidden">
        <div
          className="absolute left-0 w-[6%] min-w-[60px] h-full flex items-center justify-center text-gray-500 hover:text-gray-300 text-xl hover:bg-gray-500 cursor-pointer hover:bg-opacity-25 z-20"
          onClick={onClickPrevPost}
        >
          <PiCaretLeftBold />
        </div>
        <div
          className="relative flex-1 h-full z-10"
          onClick={handleBackgroundClick}
        >
          {originalPost.mediaUrl && originalPost.mediaType && (
            <PostDetailsMediaContent
              mediaUrl={originalPost.mediaUrl}
              mediaType={originalPost.mediaType}
              onBackgroundClick={handleBackgroundClick}
            />
          )}
        </div>
        <div
          className="absolute bottom-0 w-full z-30"
          onClick={handleBackgroundClick}
        >
          <PostDetailsActions
            originalPost={originalPost}
            onBackgroundClick={handleBackgroundClick}
            onClickAction={onClickAction}
            onToggleFollow={onToggleFollow}
          />
        </div>
        <div
          className="absolute right-0 w-[6%] min-w-[60px] h-full flex items-center justify-center text-gray-500 hover:text-gray-300 text-xl hover:bg-gray-500 cursor-pointer hover:bg-opacity-25 z-20"
          onClick={onClickNextPost}
        >
          <PiCaretRightBold />
        </div>
      </div>
      <div className="hidden md:block w-[30%] h-full z-10 overflow-y-auto">
        <RepliesThread
          originalPost={originalPost}
          onToggleFollow={onToggleFollow}
        />
      </div>
    </div>
  )
}

export default PostDetails
