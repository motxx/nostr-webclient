import React, { useState } from 'react'
import PublicChannelList from '../components/PublicChannel/PublicChannelList'
import PublicChannelChatWindow from '../components/PublicChannel/PublicChannelChatWindow'

const PublicChannel: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)

  const handleChannelSelect = (channelId: string) => {
    setSelectedChannel(channelId)
  }

  return (
    <div className="flex h-full">
      <PublicChannelList onSelectChannel={handleChannelSelect} />
      <PublicChannelChatWindow channelId={selectedChannel} />
    </div>
  )
}

export default PublicChannel
