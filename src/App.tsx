import React, { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Navigation from './components/Navigation/Navigation'
import HomePage from './pages/HomePage'
import ExplorePage from './pages/ExplorePage'
import NotificationPage from './pages/NotificationPage'
import PublicChannelPage from './pages/PublicChannelPage'
import DirectMessagePage from './pages/DirectMessagePage'
import SettingsPage from './pages/SettingsPage'
import DashboardPage from './pages/DashboardPage'
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
    image: 'https://randomuser.me/api/portraits/men/5.jpg',
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
                <HomePage
                  focusBottomTab={focusBottomTab}
                  unfocusBottomTab={unfocusBottomTab}
                  toggleFollow={toggleFollow}
                />
              }
            />
            <Route
              path="/home"
              element={
                <HomePage
                  focusBottomTab={focusBottomTab}
                  unfocusBottomTab={unfocusBottomTab}
                  toggleFollow={toggleFollow}
                />
              }
            />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/notification" element={<NotificationPage />} />
            <Route path="/public-channel" element={<PublicChannelPage />} />
            <Route
              path="/public-channel/:channelId"
              element={<PublicChannelPage />}
            />
            <Route path="/message" element={<DirectMessagePage />} />
            <Route
              path="/post"
              element={
                <HomePage
                  focusBottomTab={focusBottomTab}
                  unfocusBottomTab={unfocusBottomTab}
                  toggleFollow={toggleFollow}
                />
              }
            />
            <Route path="/dashboard" element={<DashboardPage />} />{' '}
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
          <Toaster />
        </div>
      </div>
    </Router>
  )
}

export default App
