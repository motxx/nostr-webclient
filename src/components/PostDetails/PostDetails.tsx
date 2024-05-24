import React from 'react'
import MediaContent from './MediaContent'
import PostDetailsActions from './PostDetailsActions'
import RepliesThread from '../Reply/RepliesThread'
import { PostItemType } from '../../global/types'
import { PostActionType } from '../PostItem/PostItem'

interface PostDetailsProps {
  isOpen: boolean
  onClose: () => void
  originalPost: PostItemType
  onClickAction: (type: PostActionType) => void
}

const PostDetails: React.FC<PostDetailsProps> = ({
  isOpen,
  onClose,
  originalPost,
  onClickAction,
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
        <div className="relative flex-1 h-full" onClick={handleBackgroundClick}>
          {originalPost.mediaUrl && originalPost.mediaType && (
            <MediaContent
              mediaUrl={originalPost.mediaUrl}
              mediaType={originalPost.mediaType}
              onBackgroundClick={handleBackgroundClick}
            />
          )}
          <PostDetailsActions
            originalPost={originalPost}
            onBackgroundClick={handleBackgroundClick}
            onClickAction={onClickAction}
          />
        </div>
        <div className="hidden md:block w-80 h-full">
          <RepliesThread originalPost={originalPost} />
        </div>
      </div>
    </div>
  )
}

export default PostDetails
