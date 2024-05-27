import React from 'react'

interface PublicChannelListProps {
  onSelectChannel: (channelId: string) => void
}

const channels = [
  { id: '1', name: 'General' },
  { id: '2', name: 'Music' },
  { id: '3', name: 'Programming' },
]

const PublicChannelList: React.FC<PublicChannelListProps> = ({
  onSelectChannel,
}) => {
  return (
    <div className="w-1/4 bg-gray-200 dark:bg-gray-800 p-4">
      <h2 className="text-lg font-bold mb-4">Channels</h2>
      <ul>
        {channels.map((channel) => (
          <li
            key={channel.id}
            onClick={() => onSelectChannel(channel.id)}
            className="cursor-pointer p-2 hover:bg-gray-300 dark:hover:bg-gray-700 rounded"
          >
            {channel.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PublicChannelList
