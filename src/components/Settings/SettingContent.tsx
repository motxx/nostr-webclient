import React from 'react'
import SettingProfile from './SettingProfile'
import { FiArrowLeft } from 'react-icons/fi'

interface SettingContentProps {
  setting: string
  onBack: () => void
}

const SettingContent: React.FC<SettingContentProps> = ({ setting, onBack }) => {
  const renderSettingContent = () => {
    switch (setting) {
      case 'プロフィール':
        return <SettingProfile />
      case 'ウォレット':
        return <div>ウォレットの内容</div>
      case 'リレー':
        return <div>リレーの内容</div>
      case '表示':
        return <div>表示の内容</div>
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-y-auto hide-scrollbar">
      <div className="sticky top-0 z-30 bg-white dark:bg-black flex items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <button onClick={onBack} className="sm:hidden mr-4">
          <FiArrowLeft className="text-2xl" />
        </button>
        <h2 className="text-lg font-bold">{setting}</h2>
      </div>
      <div>{renderSettingContent()}</div>
    </div>
  )
}

export default SettingContent
