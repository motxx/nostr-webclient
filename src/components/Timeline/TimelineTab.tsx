import { forwardRef } from 'react'
import { TimelineTabId, TimelineTabType } from './Timeline'

interface TimelineTabProps {
  onTabItemClick: (tabId: TimelineTabId) => void
  tabs: TimelineTabType[]
  activeTabId: TimelineTabId
}

const TimelineTab = forwardRef<HTMLDivElement, TimelineTabProps>(
  ({ onTabItemClick, tabs, activeTabId }, ref) => (
    <div className="sticky top-0 bg-white dark:bg-black z-10 overflow-x-auto hide-scrollbar">
      <div className="flex min-w-[500px] border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={
              'flex-1 whitespace-nowrap text-center text-sm py-3 border-b-2 ' +
              `${
                tab.id === activeTabId
                  ? 'border-blue-500 text-gray-700 dark:text-gray-300 font-semibold'
                  : 'border-white dark:border-black text-gray-500 dark:text-gray-500'
              } ` +
              'hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-mplus-2'
            }
            onClick={() => onTabItemClick(tab.id)}
          >
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  )
)
export default TimelineTab
