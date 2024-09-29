import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import PublicChatList from './components/PublicChatList'
import PublicChatMessageWindow from './components/PublicChatMessageWindow'
import { PublicChannel } from '@/domain/entities/PublicChat'
import { FetchChannels } from '@/domain/use_cases/FetchChannels'
import { PublicChatService } from '@/infrastructure/services/PublicChatService'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { AuthContext } from '@/context/AuthContext'

const PublicChatPage: React.FC = () => {
  const { channelId } = useParams()
  const [channels, setChannels] = useState<PublicChannel[]>([])
  const [selectedChannel, setSelectedChannel] = useState<PublicChannel | null>(
    null
  )
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { nostrClient } = useContext(AuthContext)

  useEffect(() => {
    if (nostrClient) {
      const userProfileRepository = new UserProfileService(nostrClient)
      const publicChatService = new PublicChatService(
        nostrClient,
        userProfileRepository
      )
      const fetchChannels = new FetchChannels(publicChatService)
      fetchChannels.execute().then(setChannels).catch(console.error)
    }
  }, [nostrClient])

  useEffect(() => {
    if (channelId && channels.length > 0) {
      const channel = channels.find((ch) => ch.id === channelId)
      if (channel) {
        setSelectedChannel(channel)
      }
    }
  }, [channelId, channels])

  const handleChannelSelect = (channel: PublicChannel) => {
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
        <PublicChatList
          channels={channels}
          selectedChannel={selectedChannel}
          onSelectChannel={handleChannelSelect}
        />
      </div>
      <div
        className={`flex-grow transform ${isSidebarOpen ? 'translate-x-[80%] sm:translate-x-1/3' : 'translate-x-0'} transition-transform md:translate-x-0 md:w-3/4`}
      >
        {selectedChannel && (
          <PublicChatMessageWindow
            channel={selectedChannel}
            onOpenSidebar={() => setIsSidebarOpen(true)}
          />
        )}
      </div>
    </div>
  )
}

export default PublicChatPage
