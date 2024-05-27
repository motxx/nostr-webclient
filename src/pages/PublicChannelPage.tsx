import React, { useState } from 'react'
import PublicChannelList from '../components/PublicChannel/PublicChannelList'
import PublicChannelChatWindow from '../components/PublicChannel/PublicChannelChatWindow'
import { PublicChannelType } from '../global/types'

export const PublicChannels: PublicChannelType[] = [
  { id: '1', name: 'General' },
  { id: '2', name: 'Music' },
  { id: '3', name: 'Programming' },
]

const PublicChannelPage: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<PublicChannelType>(
    PublicChannels[0]
  )

  const handleChannelSelect = (channel: PublicChannelType) => {
    setSelectedChannel(channel)
  }

  return (
    <div className="flex h-screen">
      <PublicChannelList onSelectChannel={handleChannelSelect} />
      <PublicChannelChatWindow channel={selectedChannel} />
    </div>
  )
}

export default PublicChannelPage
