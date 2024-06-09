import React, { useState, useEffect, useRef, useMemo } from 'react'
import NoteDetails from '@/components/NoteDetails/NoteDetails'
import NoteItemMedia from './NoteItemMedia'
import NoteItemActions from './NoteItemActions'
import { NoteItemType } from '@/global/types'
import RepliesThreadModal from '@/components/Reply/RepliesThreadModal'
import NoteItemHeader from './NoteItemHeader'
import NoteItemText from './NoteItemText'

type NoteItemProps = {
  note: NoteItemType
  onToggleFollow: (userId: string) => boolean
  onReply?: (userId: string) => void
}

export type PostActionType = 'reply' | 'repost' | 'like' | 'zap'

const NoteItem: React.FC<NoteItemProps> = ({
  note,
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
        onReply(note.userId)
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
        <NoteItemHeader post={note} onToggleFollow={onToggleFollow} />
      </div>
      {note.mediaType && note.mediaUrl && (
        <div className="mb-4">
          <NoteItemMedia
            mediaType={note.mediaType}
            mediaUrl={note.mediaUrl}
            content={note.content}
            openDetails={openDetails}
            youtubeIFrameRef={youtubeIFrameRef}
          />
        </div>
      )}
      <div className="px-2 sm:px-0 space-y-2 sm:space-y-4">
        <NoteItemText text={note.content} />
        <NoteItemActions
          replies={0}
          reposts={note.reposts}
          likes={note.likes}
          zaps={note.zaps}
          onClickAction={onClickAction}
        />
      </div>

      <NoteDetails
        isOpen={isDetailsOpen}
        onClose={closeDetails}
        originalNote={note}
        onClickAction={onClickAction}
        onToggleFollow={onToggleFollow}
      />
      <RepliesThreadModal
        originalNote={note}
        onClose={closeRepliesThreadModal}
        showModal={isRepliesThreadModalOpen}
        onToggleFollow={onToggleFollow}
      />
    </div>
  )
}

export default NoteItem
