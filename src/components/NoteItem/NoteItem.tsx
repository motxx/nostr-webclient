import React, { useState, useEffect, useRef, useMemo } from 'react'
import NoteDetails from '@/components/NoteDetails/NoteDetails'
import NoteItemMedia from './NoteItemMedia'
import NoteItemActions from './NoteItemActions'
import RepliesThreadModal from '@/components/Reply/RepliesThreadModal'
import NoteItemHeader from './NoteItemHeader'
import NoteItemText from './NoteItemText'
import AlertModal from '../Alert/AlertModal'
import { NoteType } from '@/domain/entities/Note'

type NoteItemProps = {
  note: NoteType
  noteDepth?: number
  onToggleFollow: (userId: string) => boolean
  onReply?: (userId: string) => void
}

export type PostActionType = 'reply' | 'repost' | 'like' | 'zap'

const NoteItem: React.FC<NoteItemProps> = ({
  note,
  noteDepth = 0,
  onToggleFollow,
  onReply,
}) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isRepliesThreadModalOpen, setIsRepliesThreadModalOpen] =
    useState(false)
  const [showJSONModal, setShowJSONModal] = useState(false)
  const youtubeIFrameRef = useRef<HTMLIFrameElement>(null)

  const openDetails = () => setIsDetailsOpen(true)
  const closeDetails = () => setIsDetailsOpen(false)
  const openRepliesThreadModal = () => setIsRepliesThreadModalOpen(true)
  const closeRepliesThreadModal = () => setIsRepliesThreadModalOpen(false)

  const isMobile = () => window.matchMedia('(max-width: 640px)').matches

  const onClickAction = (type: PostActionType) => {
    if (type === 'reply') {
      if (onReply) {
        onReply('hogeUser')
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
    <div className="relative space-y-0">
      <NoteItemHeader
        className="ml-2 sm:ml-0 pb-2"
        note={note}
        onToggleFollow={onToggleFollow}
        onShowJSON={() => setShowJSONModal(true)}
      />
      {note.media && (
        <NoteItemMedia
          className="mb-4"
          media={note.media}
          text={note.text}
          openDetails={openDetails}
          youtubeIFrameRef={youtubeIFrameRef}
        />
      )}
      {note.replyParentNote && noteDepth === 0 && (
        <div className="ml-4 sm:ml-2 mr-2 sm:mr-0 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
          <NoteItem
            note={note.replyParentNote}
            noteDepth={noteDepth + 1}
            onToggleFollow={onToggleFollow}
            onReply={onReply}
          />
        </div>
      )}
      <div className="ml-2 sm:ml-0 space-y-2 sm:space-y-4">
        <NoteItemText text={note.text} />
        {noteDepth === 0 && (
          <NoteItemActions
            repliesCount={note.replyChildNotes?.length || 0}
            repostsCount={note.reactions.repostsCount}
            likesCount={note.reactions.likesCount}
            zapsAmount={note.reactions.zapsAmount}
            onClickAction={onClickAction}
          />
        )}
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
      <AlertModal
        show={showJSONModal}
        title="ノートのJSON"
        message={`イベントID: ${note.id}`}
        textarea={true}
        textareaContent={JSON.stringify(JSON.parse(note.json || '{}'), null, 2)}
        onClose={() => setShowJSONModal(false)}
      />
    </div>
  )
}

export default NoteItem
