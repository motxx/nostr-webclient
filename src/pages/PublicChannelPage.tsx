import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PublicChannelList from '@/components/PublicChannel/PublicChannelList'
import PublicChannelChatWindow from '@/components/PublicChannel/PublicChannelChatWindow'
import { PublicChannelType } from '@/global/types'

export const PublicChannels: PublicChannelType[] = [
  { id: '1', name: '何でも質問板@Nostr' },
  { id: '2', name: '好きなボカロを紹介するスレ' },
  { id: '3', name: 'Bitcoin 101' },
]

const PublicChannelPage: React.FC = () => {
  const { channelId } = useParams()
  const [selectedChannel, setSelectedChannel] = useState<PublicChannelType>(
    PublicChannels[0]
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (channelId) {
      const channel = PublicChannels.find((ch) => ch.id === channelId)
      if (channel) {
        setSelectedChannel(channel)
      }
    }
  }, [channelId])

  const handleChannelSelect = (channel: PublicChannelType) => {
    setSelectedChannel(channel)
    setIsSidebarOpen(false)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      ></div>
      <div
        className={`fixed inset-y-0 left-0 z-30 w-[80%] sm:w-1/3 bg-gray-200 dark:bg-gray-800 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform md:relative md:translate-x-0 md:w-1/4`}
      >
        <PublicChannelList
          selectedChannel={selectedChannel}
          onSelectChannel={handleChannelSelect}
        />
      </div>
      <div
        className={`flex-grow transform ${isSidebarOpen ? 'translate-x-[80%] sm:translate-x-1/3' : 'translate-x-0'} transition-transform md:translate-x-0 md:w-3/4`}
      >
        <PublicChannelChatWindow
          channel={selectedChannel}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
      </div>
    </div>
  )
}

export default PublicChannelPage
