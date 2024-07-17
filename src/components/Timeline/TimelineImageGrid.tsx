import React, { useState, useRef, TouchEvent } from 'react'
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
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

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
        note.created_at === selectedNote.created_at
    )
    const nextIndex = currentIndex + 1
    if (nextIndex < imageNotes.length) {
      setSelectedNote(imageNotes[nextIndex])
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return

    const diffX = touchStartX.current - touchEndX.current
    const threshold = 50

    if (diffX > threshold) {
      selectNextPost()
    } else if (diffX < -threshold) {
      selectPrevPost()
    }

    touchStartX.current = null
    touchEndX.current = null
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
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <NoteDetails
            isOpen={!!selectedNote}
            onClose={closeDetails}
            originalNote={selectedNote}
            onClickAction={() => {}}
            onToggleFollow={() => false}
            onClickPrevPost={selectPrevPost}
            onClickNextPost={selectNextPost}
          />
        </div>
      )}
    </div>
  )
}

export default TimelineImageGrid
