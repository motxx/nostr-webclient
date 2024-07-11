import React, { useState } from 'react'
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom'
import Navigation from './components/Navigation/Navigation'
import HomePage from '@/features/Home'
import HashtagPage from '@/features/Hashtag'
import ExplorePage from '@/features/Explore'
import NotificationPage from '@/features/Notification'
import PublicChannelPage from '@/features/PublicChannel'
import MessagePage from '@/features/Message'
import SettingsPage from '@/features/Settings'
import DashboardPage from '@/features/Dashboard'
import toast, { Toaster } from 'react-hot-toast'
import UserPage from '@/features/Users'

const App: React.FC = () => {
  const [shouldFocusBottomTab, setShouldFocusBottomTab] =
    useState<boolean>(false)

  const focusBottomTab = () => setShouldFocusBottomTab(false)
  const unfocusBottomTab = () => setShouldFocusBottomTab(true)

  const [following, setFollowing] = useState<boolean>(false)

  const toggleFollow = (userName: string) => {
    const newFollowing = !following
    setFollowing(newFollowing)
    toast(
      `${userName}さん${newFollowing ? 'をフォローしました' : 'のフォローを解除しました'}`,
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
        <main className="w-full pl-0 sm:pl-20 lg:pl-60">
          <Routes>
            <Route path="/" element={<Navigate to="/home" />} />
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
            <Route
              path="/hashtag/:hashtag"
              element={
                <HashtagPage
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
            <Route path="/message" element={<MessagePage />} />
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
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings/*" element={<SettingsPage />} />
            <Route
              path="/user/:userId"
              element={
                <UserPage isFollowing={following} toggleFollow={toggleFollow} />
              }
            />
          </Routes>
          <Toaster />
        </main>
      </div>
    </Router>
  )
}

export default App
