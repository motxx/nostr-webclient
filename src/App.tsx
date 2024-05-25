import React, { useState } from 'react'
import Navigation from './components/Navigation/Navigation'
import Timeline from './components/Timeline/Timeline'
import toast, { Toaster } from 'react-hot-toast'
import Widgets from './components/Widgets/Widgets'
import { User } from './models/user'
import LoginPrompt from './components/Timeline/LoginPrompt'

const App: React.FC = () => {
  const [shouldFocusBottomTab, setShouldFocusBottomTab] =
    useState<boolean>(false)

  const focusBottomTab = () => setShouldFocusBottomTab(false)
  const unfocusBottomTab = () => setShouldFocusBottomTab(true)

  const mockUser = new User({
    npub: 'npub1v20e8yj9y7n58q5kfp0fahea9g4p3pmv2ufjgc6c9mcnugyeemyqu6s59g',
    pubkey: '629f93924527a7438296485e9edf3d2a2a18876c57132463582ef13e2099cec8',
    name: 'moti',
    image: '../../assets/images/example/me.png',
  })

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
            <LoginPrompt />
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
            <Widgets />
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  )
}

export default App
