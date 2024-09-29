import React, { useRef } from 'react'
import Widgets from '@/components/Widgets/Widgets'
import ExploreTimeline from './components/ExploreTimeline'
import { SubscriptionProvider } from '@/context/SubscriptionContext'

const ExplorePage: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col lg:flex-row justify-center h-full"
    >
      <SubscriptionProvider>
        <ExploreTimeline wrapperRef={wrapperRef} />
      </SubscriptionProvider>
      <div className="hidden lg:block w-1/3 min-w-[280px] max-w-[500px] py-4 overflow-y-auto hide-scrollbar max-h-screen">
        <Widgets />
      </div>
    </div>
  )
}

export default ExplorePage
