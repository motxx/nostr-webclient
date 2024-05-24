import React, { useState } from 'react'
import Navigation from './components/Navigation/Navigation'
import Timeline from './components/Timeline/Timeline'
import Trends from './components/Widgets/Trends'
import RecommendedUsers from './components/Widgets/RecommendedUsers'
import RecommendedRelays from './components/Widgets/RecommendedRelays'
import toast, { Toaster } from 'react-hot-toast'

const App: React.FC = () => {
  const [shouldFocusBottomTab, setShouldFocusBottomTab] =
    useState<boolean>(false)
  const focusBottomTab = () => setShouldFocusBottomTab(false)
  const unfocusBottomTab = () => setShouldFocusBottomTab(true)

  // ユーザデータのモック
  const [following, setFollowing] = useState<boolean>(false)

  const toggleFollow = (userId: string) => {
    setFollowing(!following)
    toast(
      `@${userId}さん${following ? 'をフォローしました' : 'のフォローを解除しました'}`,
      {
        position: 'bottom-center',
        duration: 2000,
        style: {
          borderRadius: '40px',
          background: '#1d4ed8',
          color: '#fff',
        },
      }
    )
    return true
  }

  return (
    <div className="bg-white dark:bg-black min-h-screen flex">
      <Navigation
        shouldFocusBottomTab={shouldFocusBottomTab}
        focusBottomTab={focusBottomTab}
      />
      <div className="flex flex-col w-full ml-0 sm:ml-20 lg:ml-60">
        <div className="flex justify-center">
          <div className="flex flex-col w-full max-w-2xl h-screen overflow-y-auto hide-scrollbar">
            <Timeline
              onScrollUp={focusBottomTab}
              onScrollDown={unfocusBottomTab}
              onToggleFollow={toggleFollow}
            />
          </div>
          <div
            className="hidden py-4 lg:flex flex-col w-1/3 min-w-[280px] max-w-[500px] ml-4 space-y-4 overflow-y-auto hide-scrollbar"
            style={{ maxHeight: '100vh' }}
          >
            <Trends />
            <RecommendedRelays />
            <RecommendedUsers />
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  )
}

export default App
