import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconType } from 'react-icons'
import {
  FiHome,
  FiSearch,
  FiBell,
  FiMessageSquare,
  FiPlusCircle,
  FiUsers,
  FiSettings,
} from 'react-icons/fi'
import NavigationBottomTab from './NavigationBottomTab'
import NavigationSidebar from './NavigationSidebar'

import userImage from '../../assets/images/example/me.png'

export type NavigationItemId =
  | 'home'
  | 'search'
  | 'notification'
  | 'public-channel'
  | 'message'
  | 'post'
  | 'settings'

export type NavigationItem = {
  id: NavigationItemId
  icon: IconType
  label: string
  hiddenOnMobile?: boolean
}

const user = {
  name: 'moti',
  id: '@very-very-long-user-id',
  image: userImage,
}

const navigationItems: NavigationItem[] = [
  { id: 'home', icon: FiHome, label: 'ホーム' },
  { id: 'search', icon: FiSearch, label: '探索' },
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
  },
  {
    id: 'post',
    icon: FiPlusCircle,
    label: 'ノートを書く',
    hiddenOnMobile: true,
  },
  {
    id: 'settings',
    icon: FiSettings,
    label: '設定',
    hiddenOnMobile: true,
  },
]

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleNavigate = (to: NavigationItemId) => {
    if (isMobile) {
      focusBottomTab()
    }
    navigate(`/${to}`)
  }

  return isMobile ? (
    <NavigationBottomTab
      navigationItems={navigationItems}
      user={user}
      shouldFocusBottomTab={shouldFocusBottomTab}
      onNavigate={handleNavigate}
    />
  ) : (
    <NavigationSidebar
      navigationItems={navigationItems}
      user={user}
      onNavigate={handleNavigate}
    />
  )
}

export default Navigation
