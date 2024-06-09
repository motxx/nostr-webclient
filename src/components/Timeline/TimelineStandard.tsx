import React from 'react'
import NoteItem from '@/components/NoteItem/NoteItem'
import { NoteItemType } from '@/global/types'
import classNames from 'classnames'

interface TimelineStandardProps {
  notes: Array<NoteItemType & { id: string }>
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
      {notes.map(({ id, ...note }) => (
        <div key={id} className="mb-8 sm:mb-10">
          <NoteItem note={note} onToggleFollow={onToggleFollow} />
        </div>
      ))}
    </div>
  )
}

export default TimelineStandard
