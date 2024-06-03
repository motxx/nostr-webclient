import React, { useMemo } from 'react'
import SettingSidebar from '@/components/Settings/SettingSidebar'
import SettingContent from '@/components/Settings/SettingContent'
import { useLocation } from 'react-router-dom'
import { FiEye, FiLogOut, FiUser } from 'react-icons/fi'
import { MdAccountBalanceWallet } from 'react-icons/md'
import { BiServer } from 'react-icons/bi'
import { IconType } from 'react-icons'

export type SettingNavigationItem = {
  id: string
  label: string
  icon: IconType
}

const settingItems: SettingNavigationItem[] = [
  { id: 'account', label: 'プロフィール', icon: FiUser },
  { id: 'wallet', label: 'ウォレット', icon: MdAccountBalanceWallet },
  { id: 'relay', label: 'リレー', icon: BiServer },
  { id: 'display', label: '表示', icon: FiEye },
  { id: 'logout', label: 'ログアウト', icon: FiLogOut },
]

const toSettingItem = (id: string): SettingNavigationItem => {
  return settingItems.find((item) => item.id === id) || settingItems[0]
}

const SettingsPage: React.FC = () => {
  const location = useLocation()

  const activeSettingId = useMemo(() => {
    return location.pathname.substring(9) // Remove leading '/settings'
  }, [location])

  const settingOpened = useMemo(() => {
    return activeSettingId !== ''
  }, [activeSettingId])

  const selected = useMemo(() => {
    return toSettingItem(activeSettingId)
  }, [activeSettingId])

  const handleBack = () => {
    window.history.back()
  }

  return (
    <div className="flex h-full">
      <SettingSidebar
        settingItems={settingItems}
        className={settingOpened ? 'hidden sm:block' : 'block'}
      />
      <div className="flex-1 mb-20 sm:mb-0">
        {settingOpened ? (
          <SettingContent selected={selected} onBack={handleBack} />
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
