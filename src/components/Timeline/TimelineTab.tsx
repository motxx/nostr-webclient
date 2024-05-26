import { forwardRef } from 'react'

interface TimelineTabProps {
  onTabItemClick: (tabText: string) => void
  tabs: string[]
  activeTab: string
}

const TimelineTab = forwardRef<HTMLDivElement, TimelineTabProps>(
  ({ onTabItemClick, tabs, activeTab }, ref) => (
    <div className="sticky top-0 bg-white dark:bg-black z-10 overflow-x-auto hide-scrollbar">
      <div className="flex min-w-[500px] border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`flex-1 text-center py-3 border-b-2 ${activeTab === tab ? 'border-blue-500 font-semibold text-gray-700 dark:text-gray-300' : 'border-white dark:border-black text-gray-500 dark:text-gray-500'} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-mplus-2`}
            onClick={() => onTabItemClick(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  )
)
export default TimelineTab
