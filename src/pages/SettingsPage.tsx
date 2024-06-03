import React, { useState } from 'react'
import SettingSidebar from '../components/Settings/SettingSidebar'
import SettingContent from '../components/Settings/SettingContent'

const SettingsPage: React.FC = () => {
  const [selectedSetting, setSelectedSetting] = useState<string | null>(null)

  const handleSelectSetting = (setting: string) => {
    setSelectedSetting(setting)
  }

  const handleBack = () => {
    setSelectedSetting(null)
  }

  return (
    <div className="flex h-full">
      <SettingSidebar
        className={selectedSetting ? 'hidden sm:block' : 'block'}
        selectedSetting={selectedSetting}
        handleSelectSetting={handleSelectSetting}
      />
      <div className="flex-1">
        {selectedSetting ? (
          <SettingContent setting={selectedSetting} onBack={handleBack} />
        ) : (
          <></>
        )}
      </div>
    </div>
  )
}

export default SettingsPage
