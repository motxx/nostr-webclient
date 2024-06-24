import React from 'react'
import NoteItem from '@/components/NoteItem/NoteItem'
import classNames from 'classnames'
import { NoteType } from '@/domain/entities/Note'

interface TimelineStandardProps {
  notes: NoteType[]
  onToggleFollow: (userId: string) => boolean
  className?: string
}

const TimelineStandard: React.FC<TimelineStandardProps> = ({
  notes,
  onToggleFollow,
  className,
}) => {
  return (
    <div className={classNames('sm:px-6 mb-20 max-w-xl', className)}>
      {notes.map(({ ...note }, _) => (
        <div key={note.id} className="mb-8 sm:mb-10">
          <NoteItem note={note} onToggleFollow={onToggleFollow} />
        </div>
      ))}
    </div>
  )
}

export default TimelineStandard
