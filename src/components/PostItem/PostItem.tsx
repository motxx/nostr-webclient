import React, { useState, useEffect, useRef, useMemo } from 'react'
import PostDetails from '@/components/PostDetails/PostDetails'
import PostItemMedia from './PostItemMedia'
import PostItemActions from './PostItemActions'
import { PostItemType } from '@/global/types'
import RepliesThreadModal from '@/components/Reply/RepliesThreadModal'
import PostItemHeader from './PostItemHeader'
import PostItemText from './PostItemText'

type PostItemProps = {
  post: PostItemType
  onToggleFollow: (userId: string) => boolean
  onReply?: (userId: string) => void
}

export type PostActionType = 'reply' | 'repost' | 'like' | 'zap'

const PostItem: React.FC<PostItemProps> = ({
  post,
  onToggleFollow,
  onReply,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isRepliesThreadModalOpen, setIsRepliesThreadModalOpen] =
    useState(false)
  const youtubeIFrameRef = useRef<HTMLIFrameElement>(null)

  const openDetails = () => setIsDetailsOpen(true)
  const closeDetails = () => setIsDetailsOpen(false)
  const openRepliesThreadModal = () => setIsRepliesThreadModalOpen(true)
  const closeRepliesThreadModal = () => setIsRepliesThreadModalOpen(false)

  const isMobile = () => window.matchMedia('(max-width: 640px)').matches

  const onClickAction = (type: PostActionType) => {
    if (type === 'reply') {
      if (onReply) {
        onReply(post.userId)
      } else if (isMobile()) {
        openRepliesThreadModal()
      } else {
        openDetails()
      }
    } else if (type === 'repost') {
      // handle repost action
    } else if (type === 'like') {
      // handle like action
    } else if (type === 'zap') {
      // handle zap action
    } else {
      throw new Error(`Unsupported type: ${type}`)
    }
  }

  const observer = useMemo(
    () =>
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && youtubeIFrameRef.current) {
            const src = youtubeIFrameRef.current
              .getAttribute('src')
              ?.split('?')[0]
            youtubeIFrameRef.current.setAttribute(
              'src',
              `${src}?enablejsapi=1&autoplay=1&mute=1`
            )
          }
        },
        { threshold: 0.5 }
      ),
    []
  )

  useEffect(() => {
    const iframeRef = youtubeIFrameRef.current
    if (iframeRef) observer.observe(iframeRef)

    return () => {
      if (iframeRef) observer.unobserve(iframeRef)
    }
  }, [observer])

  return (
    <div className="relative">
      <div className="px-2 pb-2 sm:px-0">
        <PostItemHeader post={post} onToggleFollow={onToggleFollow} />
      </div>
      {post.mediaType && post.mediaUrl && (
        <div className="mb-4">
          <PostItemMedia
            mediaType={post.mediaType}
            mediaUrl={post.mediaUrl}
            content={post.content}
            openDetails={openDetails}
            youtubeIFrameRef={youtubeIFrameRef}
          />
        </div>
      )}
      <div className="px-2 sm:px-0 space-y-2 sm:space-y-4">
        <PostItemText text={post.content} />
        <PostItemActions
          replies={0}
          reposts={post.reposts}
          likes={post.likes}
          zaps={post.zaps}
          onClickAction={onClickAction}
        />
      </div>

      <PostDetails
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        originalPost={post}
        onClickAction={onClickAction}
        onToggleFollow={onToggleFollow}
      />
      <RepliesThreadModal
        originalPost={post}
        onClose={closeRepliesThreadModal}
        showModal={isRepliesThreadModalOpen}
        onToggleFollow={onToggleFollow}
      />
    </div>
  )
}

export default PostItem
