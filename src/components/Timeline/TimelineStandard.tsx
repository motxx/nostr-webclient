import React, { useState, useRef } from 'react'
import PostItem from '../PostItem/PostItem'
import { posts } from '../../data/dummy-posts'
import TimelineTab from './TimelineTab'

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
  const [activeTab, setActiveTab] = useState('フォロー中')
  const tabRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
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
      <div ref={tabRef}>
        <TimelineTab
          onTabItemClick={handleTabClick}
          tabs={tabs}
          activeTab={activeTab}
        />
      </div>
      <div className="flex justify-center w-full">
        <div className="sm:pl-6 sm:pr-6 pt-4 sm:pt-8 mb-20 max-w-xl">
          {posts.map((post) => (
            <div key={post.id} className="mb-8 sm:mb-10">
              <PostItem post={post} onToggleFollow={onToggleFollow} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Timeline
