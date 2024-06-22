import React, { useState, useRef, useEffect, useCallback } from 'react'
import TimelineTab from './TimelineTab'
import TimelineStandard from './TimelineStandard'
import TimelineImageGrid from './TimelineImageGrid'
import { useSubscribeNotes } from './hooks/useSubscribeNotes'
import { HomeTimelineTabs, TimelineTabId } from './types'
import { Note } from '@/domain/entities/Note'
import { useAtom } from 'jotai'
import { followingTimelineAtom } from '@/state/atoms'

interface TimelineProps {
  onScrollUp: () => void
  onScrollDown: () => void
  onToggleFollow: (userId: string) => boolean
}

const Timeline: React.FC<TimelineProps> = ({
  onScrollUp,
  onScrollDown,
  onToggleFollow,
}) => {
  const { subscribe } = useSubscribeNotes()
  const tabRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [activeTabId, setActiveTabId] = useState<TimelineTabId>('following')
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [notes, setNotes] = useAtom(followingTimelineAtom)

  const handleNewNote = useCallback(
    (note: Note) => {
      setNotes((prevNotes) => {
        // XXX: 重複排除はNostrClient内にも存在するが、制御が上手く行っていないのでここにも存在する
        if (prevNotes.some((n) => n.id === note.id)) return prevNotes
        setIsLoading(false)
        console.log(note)
        const newNotes = [...prevNotes, note].sort((a, b) => {
          return b.created_at.getTime() - a.created_at.getTime()
        })
        return newNotes
      })
    },
    [setNotes]
  )

  useEffect(() => {
    subscribe(handleNewNote)
  }, [subscribe, handleNewNote])

  const handleTabClick = (tabId: TimelineTabId) => {
    setActiveTabId(tabId)
    if (timelineRef.current) {
      timelineRef.current.scrollTop = 0
    }
  }

  const handleScroll = () => {
    const scrollElement = timelineRef.current
    if (scrollElement) {
      const currentScrollTop = scrollElement.scrollTop
      if (tabRef.current && currentScrollTop <= tabRef.current.clientHeight) {
        onScrollUp()
      } else if (currentScrollTop > lastScrollTop) {
        onScrollDown()
      } else if (currentScrollTop < lastScrollTop) {
        onScrollUp()
      }
      setLastScrollTop(currentScrollTop)
    }
  }

  const renderFeed = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
        </div>
      )
    }

    const activeTab = HomeTimelineTabs.find((tab) => tab.id === activeTabId)
    switch (activeTab?.feedType) {
      case 'standard':
        return (
          <TimelineStandard
            className="pt-4 sm:pt-8"
            notes={notes}
            onToggleFollow={onToggleFollow}
          />
        )
      case 'image-grid':
        return <TimelineImageGrid className="pt-0 sm:pt-4" notes={notes} />
      default:
        return null
    }
  }

  return (
    <div
      ref={timelineRef}
      onScroll={handleScroll}
      className="w-full max-w-2xl mx-auto overflow-auto"
      style={{ maxHeight: '100vh' }}
    >
      <TimelineTab
        ref={tabRef}
        onTabItemClick={handleTabClick}
        tabs={HomeTimelineTabs}
        activeTabId={activeTabId}
      />
      <div className="flex justify-center w-full">{renderFeed()}</div>
    </div>
  )
}

export default Timeline
