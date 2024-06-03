import React, { useState } from 'react'
import { PostItemType } from '../../global/types'
import PostDetails from '../PostDetails/PostDetails'

interface TimelineImageGridProps {
  posts: PostItemType[]
  className?: string
}

const TimelineImageGrid: React.FC<TimelineImageGridProps> = ({
  posts,
  className,
}) => {
  const [selectedPost, setSelectedPost] = useState<PostItemType | null>(null)

  const imagePosts = posts.filter(
    (post) => post.mediaType === 'image' && post.mediaUrl
  )

  const handleImageClick = (post: PostItemType) => {
    setSelectedPost(post)
  }

  const closeDetails = () => {
    setSelectedPost(null)
  }

  const selectPrevPost = () => {
    if (!selectedPost) return
    const currentIndex = imagePosts.findIndex(
      // TODO: Use eventId instead of userId and timestamp
      (post) =>
        post.userId === selectedPost.userId &&
        post.timestamp === selectedPost.timestamp
    )
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      setSelectedPost(imagePosts[prevIndex])
    }
  }

  const selectNextPost = () => {
    if (!selectedPost) return
    const currentIndex = imagePosts.findIndex(
      // TODO: Use eventId instead of userId and timestamp
      (post) =>
        post.userId === selectedPost.userId &&
        post.timestamp === selectedPost.timestamp
    )
    const nextIndex = currentIndex + 1
    if (nextIndex < imagePosts.length) {
      setSelectedPost(imagePosts[nextIndex])
    }
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 p-0 md:px-4">
        {imagePosts.map((post) => (
          <div
            key={post.userId + post.timestamp}
            className="relative overflow-hidden cursor-pointer aspect-square md:rounded-md"
            onClick={() => handleImageClick(post)}
          >
            <img
              src={post.mediaUrl}
              alt={`posted by ${post.userName}`}
              className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-75"
            />
          </div>
        ))}
      </div>
      {selectedPost && (
        <PostDetails
          isOpen={!!selectedPost}
          onClose={closeDetails}
          originalPost={selectedPost}
          onClickAction={() => {}}
          onToggleFollow={() => false}
          onClickPrevPost={selectPrevPost}
          onClickNextPost={selectNextPost}
        />
      )}
    </div>
  )
}

export default TimelineImageGrid
