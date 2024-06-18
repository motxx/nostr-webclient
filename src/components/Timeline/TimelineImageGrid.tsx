import React, { useState } from 'react'
import NoteDetails from '@/components/NoteDetails/NoteDetails'
import { NoteType } from '@/domain/entities/Note'
import { userIdForDisplay } from '@/utils/addressConverter'

interface TimelineImageGridProps {
  notes: NoteType[]
  className?: string
}

const TimelineImageGrid: React.FC<TimelineImageGridProps> = ({
  notes,
  className,
}) => {
  const [selectedNote, setSelectedNote] = useState<NoteType | null>(null)

  // 画像メディアのみを含むノートをフィルタリング
  const imageNotes = notes.filter((note) =>
    note.media?.some((m) => m.type === 'image')
  )

  const handleImageClick = (note: NoteType) => {
    setSelectedNote(note)
  }

  const closeDetails = () => {
    setSelectedNote(null)
  }

  const selectPrevPost = () => {
    if (!selectedNote) return
    const currentIndex = imageNotes.findIndex(
      // TODO: Use eventId instead of userId and timestamp
      (note) =>
        note.id === selectedNote.id &&
        note.created_at === selectedNote.created_at
    )
    const prevIndex = currentIndex - 1
    if (prevIndex >= 0) {
      setSelectedNote(imageNotes[prevIndex])
    }
  }

  const selectNextPost = () => {
    if (!selectedNote) return
    const currentIndex = imageNotes.findIndex(
      (note) =>
        note.id === selectedNote.id &&
        note.created_at === selectedNote.created_at // XXX: idが被ることがある. TODO:subscribeに問題ないか確認.
    )
    const nextIndex = currentIndex + 1
    if (nextIndex < imageNotes.length) {
      setSelectedNote(imageNotes[nextIndex])
    }
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 p-0 md:px-4">
        {imageNotes.map((note, index) => (
          <div
            key={index}
            className="relative overflow-hidden cursor-pointer aspect-square md:rounded-md"
            onClick={() => handleImageClick(note)}
          >
            <img
              src={note.media?.find((m) => m.type === 'image')?.url}
              alt={`posted by ${userIdForDisplay(note.author)}`}
              className="w-full h-full object-cover transition-opacity duration-300 hover:opacity-75"
            />
          </div>
        ))}
      </div>
      {selectedNote && (
        <NoteDetails
          isOpen={!!selectedNote}
          onClose={closeDetails}
          originalNote={selectedNote}
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
