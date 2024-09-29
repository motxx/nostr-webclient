import { Route, Routes, Navigate } from 'react-router-dom'
import HomePage from '@/features/Home'
import HashtagPage from '@/features/Hashtag'
import ExplorePage from '@/features/Explore'
import NotificationPage from '@/features/Notification'
import PublicChatPage from '@/features/PublicChat'
import MessagePage from '@/features/Message'
import SettingsPage from '@/features/Settings'
import DashboardPage from '@/features/Dashboard'
import UserPage from '@/features/Users'

interface AppRoutesProps {
  focusBottomTab: () => void
  unfocusBottomTab: () => void
  toggleFollow: (userId: string) => boolean
}

export const AppRoutes = ({
  focusBottomTab,
  unfocusBottomTab,
  toggleFollow,
}: AppRoutesProps) => {
  return (
    <>
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
        <Route path="/public-chat" element={<PublicChatPage />} />
        <Route path="/public-chat/:channelId" element={<PublicChatPage />} />
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
          // TODO: フォロー状態の取得
          element={<UserPage isFollowing={false} toggleFollow={toggleFollow} />}
        />
      </Routes>
    </>
  )
}
