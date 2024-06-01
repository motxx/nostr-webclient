import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { IconType } from 'react-icons'
import {
  FiHome,
  FiCompass,
  FiBell,
  FiMessageSquare,
  FiUsers,
  FiSettings,
} from 'react-icons/fi'
import { TbDeviceDesktopAnalytics } from 'react-icons/tb'
import NavigationBottomTab from './NavigationBottomTab'
import NavigationSidebar from './NavigationSidebar'

export type NavigationItemId =
  | 'home'
  | 'explore'
  | 'notification'
  | 'public-channel'
  | 'message'
  | 'post'
  | 'dashboard'
  | 'settings'

export type NavigationItem = {
  id: NavigationItemId
  icon: IconType
  label: string
  hiddenOnMobile?: boolean
  hasPostNoteButton?: boolean
}

const user = {
  name: 'moti',
  id: '@very-very-long-user-id',
  image: 'https://randomuser.me/api/portraits/men/5.jpg',
}

const navigationItems: NavigationItem[] = [
  { id: 'home', icon: FiHome, label: 'ホーム', hasPostNoteButton: true },
  { id: 'explore', icon: FiCompass, label: '探索' },
  { id: 'notification', icon: FiBell, label: '通知' },
  {
    id: 'public-channel',
    icon: FiUsers,
    label: '公開チャンネル',
  },
  {
    id: 'message',
    icon: FiMessageSquare,
    label: 'メッセージ',
    hasPostNoteButton: false,
  },
  { id: 'dashboard', icon: TbDeviceDesktopAnalytics, label: 'アナリティクス' },
  { id: 'settings', icon: FiSettings, label: '設定', hiddenOnMobile: true },
]
const toItem = (id: NavigationItemId): NavigationItem =>
  navigationItems.find((item) => item.id === id)!

interface NavigationProps {
  shouldFocusBottomTab: boolean
  focusBottomTab: () => void
}

const Navigation: React.FC<NavigationProps> = ({
  shouldFocusBottomTab,
  focusBottomTab,
}) => {
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const getActiveItemId = (): NavigationItemId => {
    const path = location.pathname.substring(1) // Remove leading '/'

    if (path.startsWith('public-channel')) {
      return 'public-channel'
    }

    switch (path) {
      case 'home':
      case 'explore':
      case 'dashboard':
      case 'notification':
      case 'message':
      case 'settings':
        return path as NavigationItemId
      default:
        return 'home'
    }
  }

  const hasPostNoteButton = () =>
    toItem(getActiveItemId()).hasPostNoteButton || false

  const handleNavigate = (to: NavigationItemId) => {
    if (isMobile) {
      focusBottomTab()
    }
    navigate(`/${to}`)
  }

  return isMobile ? (
    <NavigationBottomTab
      navigationItems={navigationItems}
      shouldShowPostButton={hasPostNoteButton()}
      user={user}
      shouldFocusBottomTab={shouldFocusBottomTab}
      onNavigate={handleNavigate}
    />
  ) : (
    <NavigationSidebar
      navigationItems={navigationItems}
      user={user}
      activeItemId={getActiveItemId()}
      onNavigate={handleNavigate}
    />
  )
}

export default Navigation
