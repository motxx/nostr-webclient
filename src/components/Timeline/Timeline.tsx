import React, { useState, useRef } from 'react'
import TimelineTab from './TimelineTab'
import TimelineStandard from './TimelineStandard'

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
  const tabRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const [activeTab, setActiveTab] = useState('フォロー中')
  const [lastScrollTop, setLastScrollTop] = useState(0)

  const tabs = ['フォロー中', 'おすすめ', 'イラスト', 'コミック', 'クリップ']

  const handleTabClick = (tabText: string) => {
    setActiveTab(tabText)
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
        activeTab={activeTab}
      />
      <div className="flex justify-center w-full">
        <TimelineStandard onToggleFollow={onToggleFollow} />
      </div>
    </div>
  )
}

export default Timeline
