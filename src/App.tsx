import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Navigation from './components/Navigation/Navigation'
import Home from './pages/Home'
import Search from './pages/Search'
import Notification from './pages/Notification'
import PublicChannel from './pages/PublicChannel'
import DirectMessage from './pages/DirectMessage'
import Settings from './pages/Settings'
import Dashboard from './pages/Dashboard' // Import the new Dashboard component
import toast, { Toaster } from 'react-hot-toast'
import { User } from './models/user'

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
    <Router>
      <div className="bg-white dark:bg-black min-h-screen flex">
        <Navigation
          shouldFocusBottomTab={shouldFocusBottomTab}
          focusBottomTab={focusBottomTab}
        />
        <div className="flex flex-col w-full ml-0 sm:ml-20 lg:ml-60">
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  focusBottomTab={focusBottomTab}
                  unfocusBottomTab={unfocusBottomTab}
                  toggleFollow={toggleFollow}
                />
              }
            />
            <Route
              path="/home"
              element={
                <Home
                  focusBottomTab={focusBottomTab}
                  unfocusBottomTab={unfocusBottomTab}
                  toggleFollow={toggleFollow}
                />
              }
            />
            <Route path="/search" element={<Search />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/public-channel" element={<PublicChannel />} />
            <Route path="/message" element={<DirectMessage />} />
            <Route
              path="/post"
              element={
                <Home
                  focusBottomTab={focusBottomTab}
                  unfocusBottomTab={unfocusBottomTab}
                  toggleFollow={toggleFollow}
                />
              }
            />
            <Route path="/dashboard" element={<Dashboard />} />{' '}
            <Route path="/settings" element={<Settings />} />
          </Routes>
          <Toaster />
        </div>
      </div>
    </Router>
  )
}

export default App
