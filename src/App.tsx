import React, { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router } from 'react-router-dom'
import Navigation from '@/components/Navigation/Navigation'
import { AuthProvider } from '@/context/AuthContext'
import { AppRoutes } from '@/routes/AppRoutes'

const App: React.FC = () => {
  const [shouldFocusBottomTab, setShouldFocusBottomTab] =
    useState<boolean>(false)

  const focusBottomTab = () => setShouldFocusBottomTab(false)
  const unfocusBottomTab = () => setShouldFocusBottomTab(true)

  // const [following, setFollowing] = useState<boolean>(false)

  const toggleFollow = (userName: string) => {
    const newFollowing = true //!following
    //    setFollowing(newFollowing)
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
      <AuthProvider>
        <div className="bg-white dark:bg-black min-h-screen flex">
          <Navigation
            shouldFocusBottomTab={shouldFocusBottomTab}
            focusBottomTab={focusBottomTab}
          />
          <main className="w-full pl-0 sm:pl-20 lg:pl-60">
            <AppRoutes
              focusBottomTab={focusBottomTab}
              unfocusBottomTab={unfocusBottomTab}
              toggleFollow={toggleFollow}
            />
            <Toaster />
          </main>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
