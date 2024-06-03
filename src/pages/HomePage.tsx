import React from 'react'
import SearchBar from '../components/common/SearchBar'
import LoginPrompt from '../components/Timeline/LoginPrompt'
import Timeline from '../components/Timeline/Timeline'
import Widgets from '../components/Widgets/Widgets'

interface HomeProps {
  focusBottomTab: () => void
  unfocusBottomTab: () => void
  toggleFollow: (userId: string) => boolean
}

const HomePage: React.FC<HomeProps> = ({
  focusBottomTab,
  unfocusBottomTab,
  toggleFollow,
}) => {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-full max-w-2xl h-screen overflow-y-auto hide-scrollbar">
        <LoginPrompt />
        <Timeline
          onScrollUp={focusBottomTab}
          onScrollDown={unfocusBottomTab}
          onToggleFollow={toggleFollow}
        />
      </div>
      <div className="hidden lg:block w-1/3 min-w-[280px] max-w-[500px]">
        <div className="hidden lg:block bg-white dark:bg-black z-10 pl-8 py-4">
          <SearchBar
            onSearch={() => {
              /* routerでexploreに飛ぶ */
            }}
          />
        </div>
        <div
          className="hidden lg:flex flex-col space-y-4 overflow-y-auto hide-scrollbar pl-4"
          style={{ maxHeight: '100vh' }}
        >
          <Widgets />
        </div>
      </div>
    </div>
  )
}

export default HomePage
