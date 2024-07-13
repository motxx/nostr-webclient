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
import { PiNotePencil } from 'react-icons/pi'
import { TbDeviceDesktopAnalytics } from 'react-icons/tb'
import NavigationBottomTab from './NavigationBottomTab'
import NavigationSidebar from './NavigationSidebar'
import { PostNote } from '@/domain/use_cases/PostNote'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { NoteService } from '@/infrastructure/services/NoteService'
import { useNostrClient } from '@/hooks/useNostrClient'
import { Note } from '@/domain/entities/Note'
import PostNoteModal from '../NoteItem/PostNoteModal'
import { loggedInUserSelector } from '@/state/selectors'
import { useAtom } from 'jotai'

export type NavigationItemId =
  | 'home'
  | 'explore'
  | 'notification'
  | 'public-channel'
  | 'message'
  | 'post'
  | 'dashboard'
  | 'settings'
  | 'others'

export type NavigationItem = {
  id: NavigationItemId
  icon: IconType
  label: string
  hiddenOnMobile?: boolean
  hasPostNoteButton?: boolean
}

const navigationItems: NavigationItem[] = [
  { id: 'home', icon: FiHome, label: 'ホーム', hasPostNoteButton: true },
  { id: 'explore', icon: FiCompass, label: '探索', hasPostNoteButton: true },
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
  {
    id: 'post',
    icon: PiNotePencil,
    label: 'ノートを書く',
    hiddenOnMobile: true,
  },
]
const toItem = (id: NavigationItemId): NavigationItem | undefined =>
  navigationItems.find((item) => item.id === id)

interface NavigationProps {
  shouldFocusBottomTab: boolean
  focusBottomTab: () => void
}

const Navigation: React.FC<NavigationProps> = ({
  shouldFocusBottomTab,
  focusBottomTab,
}) => {
  const [loggedInUser] = useAtom(loggedInUserSelector)
  const { nostrClient } = useNostrClient()
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
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
        return 'others'
    }
  }

  const hasPostNoteButton = () =>
    toItem(getActiveItemId())?.hasPostNoteButton || false

  const handleNavigate = (to: NavigationItemId) => {
    if (isMobile) {
      focusBottomTab()
    }
    navigate(`/${to}`)
  }

  const handleClickPostNote = () => {
    setIsPostModalOpen(true)
  }

  const handleClosePostModal = () => {
    setIsPostModalOpen(false)
  }

  const handlePostSubmit = async (text: string, media?: File) => {
    if (!nostrClient || !loggedInUser) return
    const userProfileService = new UserProfileService(nostrClient)
    const noteService = new NoteService(nostrClient, userProfileService)
    await new PostNote(noteService).execute(
      Note.createNoteByUser(loggedInUser, text)
    )
  }

  return (
    <>
      {isMobile ? (
        <NavigationBottomTab
          navigationItems={navigationItems}
          shouldShowPostButton={hasPostNoteButton()}
          shouldFocusBottomTab={shouldFocusBottomTab}
          onNavigate={handleNavigate}
          onPostNote={handleClickPostNote}
        />
      ) : (
        <NavigationSidebar
          navigationItems={navigationItems}
          activeItemId={getActiveItemId()}
          onNavigate={handleNavigate}
          onPostNote={handleClickPostNote}
        />
      )}

      <PostNoteModal
        isOpen={isPostModalOpen}
        onClose={handleClosePostModal}
        onSubmit={handlePostSubmit}
      />
    </>
  )
}

export default Navigation
