import React from 'react'
import PostItem from '../PostItem/PostItem'
import { posts } from '../../data/dummy-posts'

interface TimelineStandardProps {
  onToggleFollow: (userId: string) => boolean
}

const TimelineStandard: React.FC<TimelineStandardProps> = ({
  onToggleFollow,
}) => {
  return (
    <div className="sm:pl-6 sm:pr-6 pt-4 sm:pt-8 mb-20 max-w-xl">
      {posts.map((post) => (
        <div key={post.id} className="mb-8 sm:mb-10">
          <PostItem post={post} onToggleFollow={onToggleFollow} />
        </div>
      ))}
    </div>
  )
}

export default TimelineStandard
