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
  const [notes, setNotes] = useAtom(followingTimelineAtom)
  const isLoading = notes.length === 0
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const handleNote = useCallback(
    (note: Note, isNewNote: boolean = true) => {
      setNotes((prevNotes) => {
        // XXX: 重複制御はNostrClient内にも存在するが、制御が十分ではないのでここにも存在する
        if (prevNotes.some((n) => n.id === note.id)) return prevNotes
        console.log(isNewNote ? 'New note:' : 'Old note:', note)
        const newNotes = isNewNote ? [note, ...prevNotes] : [...prevNotes, note]
        return newNotes.sort(
          (a, b) => b.created_at.getTime() - a.created_at.getTime()
        )
      })
    },
    [setNotes]
  )

  const handleNewNote = useCallback(
    (note: Note) => handleNote(note, true),
    [handleNote]
  )

  const handleOldNote = useCallback(
    (note: Note) => handleNote(note, false),
    [handleNote]
  )

  useEffect(() => {
    if (isLoading) {
      subscribe(handleNewNote, { limit: 20, isForever: true })
    }
  }, [isLoading, subscribe, handleNewNote])

  const loadMoreNotes = useCallback(() => {
    if (isLoadingMore || isLoading) return

    console.log('Loading more notes...')
    setIsLoadingMore(true)
    const oldestNote = notes[notes.length - 1]
    subscribe(handleOldNote, {
      until: oldestNote.created_at,
      limit: 20,
      isForever: false,
    }).then((subscription) => {
      setIsLoadingMore(false)
    })
  }, [isLoadingMore, isLoading, notes, subscribe, handleOldNote])

  const handleScroll = () => {
    const scrollElement = timelineRef.current
    if (scrollElement) {
      const currentScrollTop = scrollElement.scrollTop
      const scrollHeight = scrollElement.scrollHeight
      const clientHeight = scrollElement.clientHeight

      if (tabRef.current && currentScrollTop <= tabRef.current.clientHeight) {
        onScrollUp()
      } else if (currentScrollTop > lastScrollTop) {
        onScrollDown()
      } else if (currentScrollTop < lastScrollTop) {
        onScrollUp()
      }

      // 画面の2倍の高さが残っている時点で新しい投稿を読み込む
      if (scrollHeight - currentScrollTop <= clientHeight * 3) {
        loadMoreNotes()
      }

      setLastScrollTop(currentScrollTop)
    }
  }

  const handleTabClick = (tabId: TimelineTabId) => {
    setActiveTabId(tabId)
    if (timelineRef.current) {
      timelineRef.current.scrollTop = 0
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
      {isLoadingMore && (
        <div className="flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      )}
    </div>
  )
}

export default Timeline
