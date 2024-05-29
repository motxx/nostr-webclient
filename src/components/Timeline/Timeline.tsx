import React, { useState, useRef } from 'react'
import TimelineTab from './TimelineTab'
import TimelineStandard from './TimelineStandard'
import TimelineImageGrid from './TimelineImageGrid'
import { posts } from '../../data/dummy-posts'

interface TimelineProps {
  onScrollUp: () => void
  onScrollDown: () => void
  onToggleFollow: (userId: string) => boolean
}

export type TimelineTabId = 'following' | 'recommended' | 'images' | 'clips'
export type TimelineFeedType = 'standard' | 'image-grid' | 'video-swipe'
export type TimelineTabType = {
  id: TimelineTabId
  feedType: TimelineFeedType
  name: string
}

const Timeline: React.FC<TimelineProps> = ({
  onScrollUp,
  onScrollDown,
  onToggleFollow,
}) => {
  const tabRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [activeTabId, setActiveTabId] = useState<TimelineTabId>('following')
  const [lastScrollTop, setLastScrollTop] = useState(0)

  const tabs: TimelineTabType[] = [
    {
      id: 'following',
      feedType: 'standard',
      name: 'フォロー中',
    },
    {
      id: 'recommended',
      feedType: 'standard',
      name: 'おすすめ',
    },
    {
      id: 'images',
      feedType: 'image-grid',
      name: 'イラスト・マンガ',
    },
    {
      id: 'clips',
      feedType: 'video-swipe',
      name: 'クリップ',
    },
  ]

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
    const activeTab = tabs.find((tab) => tab.id === activeTabId)
    if (activeTab?.feedType === 'standard') {
      return <TimelineStandard posts={posts} onToggleFollow={onToggleFollow} />
    } else if (activeTab?.feedType === 'image-grid') {
      return <TimelineImageGrid posts={posts} />
    } else {
      // 他のフィードタイプのコンポーネントもここに追加できます
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
        tabs={tabs}
        activeTabId={activeTabId}
      />
      <div className="flex justify-center w-full">{renderFeed()}</div>
    </div>
  )
}

export default Timeline
