import React, { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router } from 'react-router-dom'
import Navigation from '@/components/Navigation/Navigation'
import { AppRoutes } from '@/routes/AppRoutes'

const App: React.FC = () => {
  const [shouldFocusBottomTab, setShouldFocusBottomTab] =
    useState<boolean>(false)

  const focusBottomTab = () => setShouldFocusBottomTab(false)
  const unfocusBottomTab = () => setShouldFocusBottomTab(true)

  return (
    <Router>
      <div className="bg-white dark:bg-black min-h-screen flex">
        <Navigation
          shouldFocusBottomTab={shouldFocusBottomTab}
          focusBottomTab={focusBottomTab}
        />
        <main className="w-full pl-0 sm:pl-20 lg:pl-60">
          <AppRoutes
            focusBottomTab={focusBottomTab}
            unfocusBottomTab={unfocusBottomTab}
          />
          <Toaster />
        </main>
      </div>
    </Router>
  )
}

export default App
