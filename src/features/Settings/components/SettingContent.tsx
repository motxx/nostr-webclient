import React from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { SettingNavigationItem } from '../types'
import SettingProfile from './SettingProfile'
import SettingWallet from './SettingWallet'
import SettingRelay from './SettingRelay'

interface SettingContentProps {
  selected: SettingNavigationItem
  onBack: () => void
}

const SettingContent: React.FC<SettingContentProps> = ({
  selected,
  onBack,
}) => {
  return (
    <div className="flex flex-col h-screen overflow-y-auto hide-scrollbar">
      <div className="sticky top-0 z-30 bg-white dark:bg-black flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="sm:hidden mr-4">
          <FiArrowLeft className="text-2xl" />
        </button>
        <h2 className="text-lg font-bold">{selected.label}</h2>
      </div>
      {selected.id === 'account' ? (
        <SettingProfile />
      ) : selected.id === 'wallet' ? (
        <SettingWallet />
      ) : selected.id === 'relay' ? (
        <SettingRelay />
      ) : selected.id === 'display' ? (
        <div>表示の内容</div>
      ) : null}
    </div>
  )
}

export default SettingContent
