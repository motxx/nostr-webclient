import React, { useState, useRef, useEffect, useCallback } from 'react'
import { NoteType, Media } from '@/domain/entities/Note'
import NoteDetails from '@/components/NoteDetails/NoteDetails'
import NoteItemActions from '@/components/NoteItem/NoteItemActions'
import NoteItemHeader from '@/components/NoteItem/NoteItemHeader'
import { PostActionType } from '@/domain/entities/Note'
import { convertToEmbedUrl } from '@/utils/contentConverter'

interface TimelineVideoSwipeProps {
  notes: NoteType[]
  onToggleFollow: (userId: string) => boolean
  className?: string
}

const TimelineVideoSwipe: React.FC<TimelineVideoSwipeProps> = ({
  notes,
  onToggleFollow,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [youtubeApiReady, setYoutubeApiReady] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const youtubeRefs = useRef<any[]>([])

  const videoNotes = notes.filter((note) =>
    note.media?.some((m) => m.type === 'video' || m.type === 'youtube')
  )

  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (!window.YT) {
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        const firstScriptTag = document.getElementsByTagName('script')[0]
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

        window.onYouTubeIframeAPIReady = () => {
          setYoutubeApiReady(true)
        }
      } else {
        setYoutubeApiReady(true)
      }
    }

    loadYouTubeAPI()

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const playCurrentMedia = useCallback(() => {
    if (videoNotes.length === 0 || currentIndex >= videoNotes.length) {
      return
    }

    const currentMedia = videoNotes[currentIndex].media?.find(
      (m) => m.type === 'video' || m.type === 'youtube'
    )
    if (currentMedia?.type === 'video') {
      const video = videoRefs.current[currentIndex]
      if (video) {
        video
          .play()
          .catch((error) => console.error('Error playing video:', error))
      }
    } else if (currentMedia?.type === 'youtube') {
      const player = youtubeRefs.current[currentIndex]
      if (player && player.playVideo) {
        player.playVideo()
      }
    }
  }, [currentIndex, videoNotes])

  useEffect(() => {
    playCurrentMedia()
  }, [currentIndex, playCurrentMedia])

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current && videoNotes.length > 0) {
        const scrollPosition = containerRef.current.scrollTop
        const videoHeight = containerRef.current.clientHeight
        const newIndex = Math.round(scrollPosition / videoHeight)
        if (newIndex !== currentIndex && newIndex < videoNotes.length) {
          setCurrentIndex(newIndex)
        }
      }
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
    }
  }, [currentIndex, videoNotes.length])

  const handleSwipe = (direction: 'up' | 'down') => {
    if (videoNotes.length === 0) return

    const newIndex =
      direction === 'up'
        ? Math.min(currentIndex + 1, videoNotes.length - 1)
        : Math.max(currentIndex - 1, 0)
    setCurrentIndex(newIndex)
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: newIndex * containerRef.current.clientHeight,
        behavior: 'smooth',
      })
    }
  }

  const handleTouchStart = useRef<number | null>(null)
  const handleTouchEnd = useRef<number | null>(null)

  const onTouchStart = (e: React.TouchEvent) => {
    handleTouchStart.current = e.targetTouches[0].clientY
  }

  const onTouchMove = (e: React.TouchEvent) => {
    handleTouchEnd.current = e.targetTouches[0].clientY
  }

  const onTouchEnd = () => {
    if (!handleTouchStart.current || !handleTouchEnd.current) return
    const distance = handleTouchStart.current - handleTouchEnd.current
    const isSignificantSwipe = Math.abs(distance) > 10

    if (isSignificantSwipe) {
      if (distance > 0) {
        handleSwipe('up')
      } else {
        handleSwipe('down')
      }
    }

    handleTouchStart.current = null
    handleTouchEnd.current = null
  }

  const handleMediaClick = () => {
    setIsDetailsOpen(true)
  }

  const closeDetails = () => {
    setIsDetailsOpen(false)
  }

  const handleClickAction = (type: PostActionType) => {
    if (videoNotes.length > 0) {
      console.log(
        `Action ${type} clicked for note ${videoNotes[currentIndex].id}`
      )
    }
  }

  const renderMedia = (media: Media, index: number) => {
    const mediaClassName = isMobile ? 'w-full h-full' : 'w-full h-full max-w-xl'

    if (media.type === 'video') {
      return (
        <video
          ref={(el) => (videoRefs.current[index] = el)}
          src={media.url}
          className={`${mediaClassName} object-contain`}
          playsInline
          muted
          loop
          onClick={handleMediaClick}
        />
      )
    } else if (media.type === 'youtube') {
      return (
        <div className={mediaClassName}>
          <div
            id={`youtube-player-${index}`}
            className="w-full h-full"
            onClick={handleMediaClick}
          />
        </div>
      )
    }
    return null
  }

  useEffect(() => {
    if (youtubeApiReady) {
      videoNotes.forEach((note, index) => {
        const media = note.media?.find((m) => m.type === 'youtube')
        if (media && media.type === 'youtube') {
          const embedUrl = convertToEmbedUrl(media.url)
          const videoId = embedUrl.split('/').pop() || ''
          if (!youtubeRefs.current[index]) {
            youtubeRefs.current[index] = new window.YT.Player(
              `youtube-player-${index}`,
              {
                videoId: videoId,
                playerVars: {
                  autoplay: 0,
                  controls: 1,
                  rel: 0,
                  playsinline: 1,
                  mute: 1,
                  loop: 1,
                  playlist: videoId,
                },
                events: {
                  onReady: (event) => {
                    if (index === currentIndex) {
                      event.target.playVideo()
                    }
                  },
                },
              }
            )
          }
        }
      })
    }
  }, [youtubeApiReady, videoNotes, currentIndex])

  const containerClassName = isMobile
    ? 'h-[calc(100vh-12rem)]'
    : 'h-screen max-w-4xl mx-auto'

  if (videoNotes.length === 0) {
    return (
      <div
        className={`${containerClassName} ${className} flex items-center justify-center`}
      >
        <p className="text-center text-gray-500">No video content available.</p>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`${containerClassName} overflow-y-scroll snap-y snap-mandatory ${className}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {videoNotes.map((note, index) => (
        <div
          key={note.id}
          className={`${
            isMobile ? 'h-[calc(100vh-12rem)]' : 'h-screen'
          } w-full snap-start flex flex-col justify-center items-center relative`}
        >
          {renderMedia(
            note.media?.find(
              (m) => m.type === 'video' || m.type === 'youtube'
            ) as Media,
            index
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <NoteItemHeader
              note={note}
              onToggleFollow={onToggleFollow}
              onShowJSON={() => {}}
              className="text-white"
            />
            <NoteItemActions
              repliesCount={note.receivedReplyNotes?.length || 0}
              repostsCount={note.reactions.repostsCount}
              likesCount={note.reactions.likesCount}
              zapsAmount={note.reactions.zapsAmount}
              customReactions={note.reactions.customReactions}
              onClickAction={handleClickAction}
            />
          </div>
        </div>
      ))}
      {isDetailsOpen && videoNotes.length > 0 && (
        <NoteDetails
          isOpen={isDetailsOpen}
          onClose={closeDetails}
          originalNote={videoNotes[currentIndex]}
          onClickAction={handleClickAction}
          onToggleFollow={onToggleFollow}
        />
      )}
    </div>
  )
}

export default TimelineVideoSwipe
