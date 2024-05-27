import React, { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ItemTypes } from './ItemTypes'
import { getEmptyImage } from 'react-dnd-html5-backend'

interface DashboardCardProps {
  id: number
  moveCard: (id: number, toIndex: number) => void
  findCard: (id: number) => { index: number }
  children: React.ReactNode
}

interface DragCard {
  id: number
  originalIndex: number
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  id,
  moveCard,
  findCard,
  children,
}) => {
  const originalIndex = findCard(id).index
  const ref = useRef<HTMLDivElement>(null)

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemTypes.CARD,
    item: { id, originalIndex },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: DragCard, monitor) => {
      const { id: droppedId, originalIndex } = item
      const didDrop = monitor.didDrop()
      if (!didDrop) {
        moveCard(droppedId, originalIndex)
      }
    },
  })

  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    hover({ id: draggedId }: DragCard) {
      if (draggedId !== id) {
        const { index: overIndex } = findCard(id)
        moveCard(draggedId, overIndex)
      }
    },
  })

  drag(drop(ref))
  preview(getEmptyImage(), { captureDraggingState: true })

  const opacity = isDragging ? 0.5 : 1
  return (
    <div
      ref={ref}
      style={{
        opacity,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-md shadow-md"
    >
      {children}
      {isDragging && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid black',
            backgroundColor: 'white',
            zIndex: 1000,
            opacity: 0.8,
            pointerEvents: 'none',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
