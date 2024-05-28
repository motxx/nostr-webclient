import React from 'react'
import { PublicChannels } from '../../pages/PublicChannelPage'
import { PublicChannelType } from '../../global/types'

interface PublicChannelListProps {
  selectedChannel: PublicChannelType
  onSelectChannel: (channel: PublicChannelType) => void
}

const PublicChannelList: React.FC<PublicChannelListProps> = ({
  selectedChannel,
  onSelectChannel,
}) => {
  return (
    <div className="bg-gray-200 dark:bg-gray-800 p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4">公開チャンネル</h2>
      <ul className="flex-grow overflow-auto">
        {PublicChannels.map((channel) => (
          <li
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
            className={`cursor-pointer p-2 ${channel.id === selectedChannel.id ? 'font-bold' : 'text-gray-600 dark:text-gray-400'} hover:bg-gray-300 dark:hover:bg-gray-700 font-noto-sans rounded`}
          >
            # {channel.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PublicChannelList
