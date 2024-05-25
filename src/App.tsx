import React, { useState } from 'react'
import Navigation from './components/Navigation/Navigation'
import toast, { Toaster } from 'react-hot-toast'
import { User } from './models/user'
import Home from './pages/Home'

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
        <Home
          focusBottomTab={focusBottomTab}
          unfocusBottomTab={unfocusBottomTab}
          toggleFollow={toggleFollow}
        />
        <Toaster />
      </div>
    </div>
  )
}

export default App
