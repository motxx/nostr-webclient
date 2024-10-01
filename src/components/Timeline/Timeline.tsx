import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useContext,
} from 'react'
import TimelineTab from './TimelineTab'
import TimelineStandard from './TimelineStandard'
import TimelineImageGrid from './TimelineImageGrid'
import TimelineVideoSwipe from './TimelineVideoSwipe'
import { useNotesTimeline } from './hooks/useNotesTimeline'
import { HomeTimelineTabs, TimelineTabId } from './types'
import Spinner from '../ui-elements/Spinner'
import { useFetchNotes } from './hooks/useFetchNotes'
import { AppContext } from '@/context/AppContext'

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
  const {
    auth: { loggedInUser, readOnlyUser },
  } = useContext(AppContext)
  const tabRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [activeTabId, setActiveTabId] = useState<TimelineTabId>('following')
  const [lastScrollTop, setLastScrollTop] = useState(0)
  const [showSpinner, setShowSpinner] = useState(true)

  const authorPubkeys = useMemo(
    () =>
      loggedInUser
        ? loggedInUser.followingUsers?.map((user) => user.pubkey)
        : readOnlyUser?.followingUsers?.map((user) => user.pubkey) ?? [],
    [loggedInUser, readOnlyUser]
  )

  const { notes, isTimelineLoading } = useNotesTimeline({
    hashtag,
    authorPubkeys,
  })
  const { fetchNotes, isFetchingPastNotes } = useFetchNotes({
    limit: 20,
    hashtag,
    authorPubkeys,
  })

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (!isTimelineLoading && !isFetchingPastNotes) {
      timer = setTimeout(() => setShowSpinner(false), 300)
    } else {
      setShowSpinner(true)
    }
    return () => clearTimeout(timer)
  }, [isTimelineLoading, isFetchingPastNotes])

  const checkAndLoadMore = useCallback(() => {
    if (contentRef.current && wrapperRef.current) {
      const contentHeight = contentRef.current.offsetHeight
      const wrapperHeight = wrapperRef.current.offsetHeight
      if (
        contentHeight < wrapperHeight &&
        !isTimelineLoading &&
        !isFetchingPastNotes
      ) {
        fetchNotes()
      }
    }
  }, [isTimelineLoading, isFetchingPastNotes, fetchNotes])

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
        !isTimelineLoading &&
        !isFetchingPastNotes &&
        scrollHeight - currentScrollTop <= clientHeight * 1.5
      ) {
        fetchNotes()
      }

      setLastScrollTop(currentScrollTop)
    }
  }, [
    isTimelineLoading,
    isFetchingPastNotes,
    lastScrollTop,
    onScrollDown,
    onScrollUp,
    fetchNotes,
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
            {showSpinner && <Spinner size="md" color="blue-500" />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timeline
