import React, { useEffect, useState } from 'react'
import { IconType } from 'react-icons'
import {
  FiHome,
  FiSearch,
  FiBell,
  FiMessageSquare,
  FiPlusCircle,
  FiUsers,
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

export type NavigationItem = {
  id: NavigationItemId
  icon: IconType
  label: string
  onClick: () => void
}

const user = {
  name: 'moti',
  id: '@very-very-long-user-id',
  image: userImage,
}

const navigationItems: NavigationItem[] = [
  { id: 'home', icon: FiHome, label: 'ホーム', onClick: () => {} },
  { id: 'search', icon: FiSearch, label: '探索', onClick: () => {} },
  { id: 'notification', icon: FiBell, label: '通知', onClick: () => {} },
  {
    id: 'public-channel',
    icon: FiUsers,
    label: '公開チャンネル',
    onClick: () => {},
  },
  {
    id: 'message',
    icon: FiMessageSquare,
    label: 'メッセージ',
    onClick: () => {},
  },
  { id: 'post', icon: FiPlusCircle, label: 'ノートを書く', onClick: () => {} },
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
    console.log(`${to} clicked`)
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
