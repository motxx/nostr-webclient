import React, { useRef, useEffect, useState } from 'react'
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
  const [height, setHeight] = useState<number | string>('auto')

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

  const handleResize = () => {
    if (ref.current) {
      setHeight(ref.current.clientHeight)
    }
  }

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  useEffect(() => {
    handleResize()
  }, [children])

  const opacity = isDragging ? 0.5 : 1
  return (
    <div
      ref={ref}
      style={{ opacity, height }}
      className="relative flex items-center justify-center sm:dark:bg-gray-800 p-4 sm:p-6 rounded-md shadow-md overflow-hidden h-full"
    >
      <div className="flex flex-col w-full h-full max-w-full box-border">
        {children}
      </div>
      {isDragging && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center border border-black bg-white z-50 opacity-80 pointer-events-none">
          {children}
        </div>
      )}
    </div>
  )
}
