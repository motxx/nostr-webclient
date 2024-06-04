import React, { useState } from 'react'
import { FiPlus, FiTrash } from 'react-icons/fi'
import Input from '@/components/ui-elements/Input'
import PrimaryButton from '@/components/ui-parts/PrimaryButton'

const SettingRelay: React.FC = () => {
  const [relays, setRelays] = useState<string[]>(['wss://relay.example.com'])
  const [newRelayUrl, setNewRelayUrl] = useState('')

  const handleAddRelay = () => {
    if (newRelayUrl && !relays.includes(newRelayUrl)) {
      setRelays([...relays, newRelayUrl])
      setNewRelayUrl('')
    }
  }

  const handleRemoveRelay = (url: string) => {
    setRelays(relays.filter((relay) => relay !== url))
  }

  const handleSaveRelays = () => {
    console.log('保存されたリレー:', relays)
    // 保存処理をここに追加
  }

  return (
    <div className="p-4 space-y-8">
      <div className="space-y-4">
        <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">
          接続中のリレー
        </label>
        <ul className="space-y-2">
          {relays.map((relay, index) => (
            <li
              key={index}
              className="flex justify-between items-center p-2 border border-gray-200 dark:border-gray-700 rounded-md"
            >
              <span className="text-gray-700 dark:text-gray-200">{relay}</span>
              <button
                onClick={() => handleRemoveRelay(relay)}
                className="text-red-500 hover:text-red-700"
              >
                <FiTrash />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-4">
        <label className="block font-semibold text-gray-700 dark:text-gray-200 mb-2">
          リレーの追加
        </label>
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newRelayUrl}
            onChange={(e) => setNewRelayUrl(e.target.value)}
            placeholder="wss://relay.example.com"
            className="w-full p-2 border border-gray-200 dark:border-gray-700 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <PrimaryButton onClick={handleAddRelay} className="rounded-md">
            <FiPlus />
          </PrimaryButton>
        </div>
      </div>
      <PrimaryButton
        onClick={handleSaveRelays}
        className="flex items-center space-x-2 bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-700"
      >
        保存
      </PrimaryButton>
    </div>
  )
}

export default SettingRelay
