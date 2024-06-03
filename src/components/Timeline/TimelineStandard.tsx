import React from 'react'
import PostItem from '../PostItem/PostItem'
import { PostItemType } from '../../global/types'
import classNames from 'classnames'

interface TimelineStandardProps {
  posts: Array<PostItemType & { id: string }>
  onToggleFollow: (userId: string) => boolean
  className?: string
}

const TimelineStandard: React.FC<TimelineStandardProps> = ({
  posts,
  onToggleFollow,
  className,
}) => {
  return (
    <div className={classNames('sm:px-6 mb-20 max-w-xl', className)}>
      {posts.map(({ id, ...post }) => (
        <div key={id} className="mb-8 sm:mb-10">
          <PostItem post={post} onToggleFollow={onToggleFollow} />
        </div>
      ))}
    </div>
  )
}

export default TimelineStandard
