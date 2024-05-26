import React from 'react'
import PostItem from '../PostItem/PostItem'
import { PostItemType } from '../../global/types'

interface TimelineStandardProps {
  posts: Array<PostItemType & { id: string }>
  onToggleFollow: (userId: string) => boolean
}

const TimelineStandard: React.FC<TimelineStandardProps> = ({
  posts,
  onToggleFollow,
}) => {
  return (
    <div className="sm:px-6 pt-4 sm:pt-8 mb-20 max-w-xl">
      {posts.map(({ id, ...post }) => (
        <div key={id} className="mb-8 sm:mb-10">
          <PostItem post={post} onToggleFollow={onToggleFollow} />
        </div>
      ))}
    </div>
  )
}

export default TimelineStandard
