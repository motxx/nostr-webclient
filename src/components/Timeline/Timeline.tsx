import React, { useState, useRef, useCallback, useEffect } from 'react'
import TimelineTab from './TimelineTab'
import TimelineStandard from './TimelineStandard'
import TimelineImageGrid from './TimelineImageGrid'
import TimelineVideoSwipe from './TimelineVideoSwipe'
import { useInfiniteNotes } from './hooks/useInfiniteNotes'
import { HomeTimelineTabs, TimelineTabId } from './types'

interface TimelineProps {
  onScrollUp: () => void
  onScrollDown: () => void
  onToggleFollow: (userId: string) => boolean
  hashtag?: string
  showTabs?: boolean
}

const Timeline: React.FC<TimelineProps> = ({
  onScrollUp,
  onScrollDown,
  onToggleFollow,
  hashtag,
  showTabs = true,
}) => {
  const tabRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeTabId, setActiveTabId] = useState<TimelineTabId>('following')
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const [showSpinner, setShowSpinner] = useState(true)

  const { notes, isLoading, isLoadingMore, loadMoreNotes } = useInfiniteNotes({
    limit: 20,
    hashtag,
  })

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (!isLoading && !isLoadingMore) {
      timer = setTimeout(() => setShowSpinner(false), 300)
    } else {
      setShowSpinner(true)
    }
    return () => clearTimeout(timer)
  }, [isLoading, isLoadingMore])

  const checkAndLoadMore = useCallback(() => {
    if (contentRef.current && wrapperRef.current) {
      const contentHeight = contentRef.current.offsetHeight
      const wrapperHeight = wrapperRef.current.offsetHeight
      if (contentHeight < wrapperHeight && !isLoading && !isLoadingMore) {
        loadMoreNotes()
      }
    }
  }, [isLoading, isLoadingMore, loadMoreNotes])

  useEffect(() => {
    checkAndLoadMore()
  }, [notes, checkAndLoadMore])

  const handleScroll = useCallback(() => {
    const wrapperElement = wrapperRef.current
    const scrollElement = timelineRef.current
    if (wrapperElement && scrollElement) {
      const currentScrollTop = scrollElement.scrollTop
      const scrollHeight = scrollElement.scrollHeight
      const clientHeight = wrapperElement.clientHeight

      if (tabRef.current && currentScrollTop <= tabRef.current.clientHeight) {
        onScrollUp()
      } else if (currentScrollTop > lastScrollTop) {
        onScrollDown()
      } else if (currentScrollTop < lastScrollTop) {
        onScrollUp()
      }

      if (
        !isLoading &&
        !isLoadingMore &&
        scrollHeight - currentScrollTop <= clientHeight * 1.5
      ) {
        loadMoreNotes()
      }

      setLastScrollTop(currentScrollTop)
    }
  }, [
    isLoading,
    isLoadingMore,
    lastScrollTop,
    onScrollDown,
    onScrollUp,
    loadMoreNotes,
  ])

  const handleTabClick = (tabId: TimelineTabId) => {
    setActiveTabId(tabId)
    if (timelineRef.current) {
      timelineRef.current.scrollTop = 0
    }
  }

  const renderFeed = () => {
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
      case 'video-swipe':
        return (
          <TimelineVideoSwipe
            className="pt-0 sm:pt-4"
            notes={notes}
            onToggleFollow={onToggleFollow}
          />
        )
      default:
        return null
    }
  }

  return (
    <div ref={wrapperRef} className="h-full">
      <div
        ref={timelineRef}
        onScroll={handleScroll}
        className="w-full max-w-2xl max-h-[100vh] mx-auto overflow-auto"
      >
        {showTabs && (
          <TimelineTab
            ref={tabRef}
            onTabItemClick={handleTabClick}
            tabs={HomeTimelineTabs}
            activeTabId={activeTabId}
          />
        )}
        {hashtag && <h1 className="text-2xl font-bold p-4">#{hashtag}</h1>}
        <div ref={contentRef} className="flex flex-col items-center w-full">
          {renderFeed()}
          <div className="w-full h-16 flex items-center justify-center">
            {showSpinner && (
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timeline
