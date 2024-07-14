import React from 'react'
import HashSearchBar from '@/components/ui-parts/HashSearchBar'
import LoginPrompt from '@/components/ui-parts/LoginPrompt'
import Widgets from '@/components/Widgets/Widgets'

interface TimelineLayoutProps {
  children: React.ReactNode
}

const TimelineLayout: React.FC<TimelineLayoutProps> = ({ children }) => {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-full max-w-2xl h-screen overflow-y-auto hide-scrollbar">
        <LoginPrompt />
        {children}
      </div>
      <aside className="hidden lg:block w-1/3 min-w-[280px] max-w-[500px]">
        <div className="bg-white dark:bg-black z-10 pl-8 py-4">
          <HashSearchBar
            onSearch={(term, hashtags) => {
              /* routerでexploreに飛ぶ */
            }}
          />
        </div>
        <div
          className="flex flex-col space-y-4 overflow-y-auto hide-scrollbar pl-4"
          style={{ maxHeight: '100vh' }}
        >
          <Widgets />
        </div>
      </aside>
    </div>
  )
}

export default TimelineLayout
