import React, { useState, useEffect, useRef, useMemo } from 'react'
import PostDetails from '../PostDetails/PostDetails'
import PostItemMedia from './PostItemMedia'
import PostItemActions from './PostItemActions'
import { PostItemType } from '../../global/types'
import toast, { Toaster } from 'react-hot-toast'
import RepliesThreadModal from '../Reply/RepliesThreadModal'
import PostItemHeader from './PostItemHeader'
import PostItemText from './PostItemText'

type PostItemProps = PostItemType & {
  onToggleFollow: () => boolean
}

export type PostActionType = 'reply' | 'repost' | 'like' | 'zap'

const PostItem: React.FC<PostItemProps> = ({
  userName,
  userId,
  verified,
  content,
  likes,
  reposts,
  zaps,
  userImage,
  timestamp,
  mediaUrl,
  mediaType,
  following,
  onToggleFollow,
}) => {
  const [isFollowing, setIsFollowing] = useState(following)
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
      if (isMobile()) {
        openRepliesThreadModal()
      } else {
        openDetails()
      }
    } else if (type === 'repost') {
    } else if (type === 'like') {
    } else if (type === 'zap') {
    } else {
      throw new Error(`Unsupported type: ${type}`)
    }
  }

  const toggleFollow = () => {
    const success = onToggleFollow()
    if (success) {
      const newIsFollowing = !isFollowing
      setIsFollowing(newIsFollowing)
      toast(
        `@${userId}さん${newIsFollowing ? 'をフォローしました' : 'のフォローを解除しました'}`,
        {
          position: 'bottom-center',
          duration: 2000,
          style: {
            borderRadius: '40px',
            background: '#1d4ed8',
            color: '#fff',
          },
        }
      )
    } else {
      toast.error('Failed to follow/unfollow user. Please try again.')
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
        <PostItemHeader
          userId={userId}
          userName={userName}
          userImage={userImage}
          verified={verified}
          timestamp={timestamp}
          isFollowing={isFollowing}
          toggleFollow={toggleFollow}
        />
      </div>
      {mediaType && mediaUrl && (
        <div className="mb-4">
          <PostItemMedia
            mediaType={mediaType}
            mediaUrl={mediaUrl}
            content={content}
            openDetails={openDetails}
            youtubeIFrameRef={youtubeIFrameRef}
          />
        </div>
      )}
      <div className="px-2 sm:px-0 space-y-2 sm:space-y-4">
        <PostItemText text={content} />
        <PostItemActions
          replies={0}
          reposts={reposts}
          likes={likes}
          zaps={zaps}
          onClickAction={onClickAction}
        />
      </div>

      <PostDetails
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        originalPost={{
          userId,
          userName,
          verified,
          content,
          replies: 0,
          likes,
          reposts,
          zaps,
          userImage,
          timestamp,
          mediaUrl,
          mediaType,
          following: isFollowing,
        }}
        onClickAction={onClickAction}
      />
      <RepliesThreadModal
        onClose={closeRepliesThreadModal}
        showModal={isRepliesThreadModalOpen}
        originalPost={{
          userId,
          userName,
          verified,
          content,
          replies: 0,
          likes,
          reposts,
          zaps,
          userImage,
          timestamp,
          mediaUrl,
          mediaType,
          following: isFollowing,
        }}
      />
      <Toaster />
    </div>
  )
}

export default PostItem
