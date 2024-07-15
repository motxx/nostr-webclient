import React from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicChannel } from '@/domain/entities/PublicChat'

interface PublicChatListProps {
  channels: PublicChannel[]
  selectedChannel: PublicChannel | null
  onSelectChannel: (channel: PublicChannel) => void
}

const PublicChatList: React.FC<PublicChatListProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
}) => {
  const navigate = useNavigate()

  const handleChannelClick = (channel: PublicChannel) => {
    onSelectChannel(channel)
    navigate(`/public-chat/${channel.id}`)
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-950 border-r-8 border-gray-200 dark:border-gray-900 p-4 h-full flex flex-col">
      <h2 className="text-lg font-bold mb-4">公開チャンネル</h2>
      <ul className="flex-grow overflow-auto">
        {channels.map((channel) => (
          <li
            key={channel.id}
            onClick={() => handleChannelClick(channel)}
            className={`cursor-pointer p-2 ${
              channel.id === selectedChannel?.id
                ? 'font-semibold text-gray-900 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-400'
            } hover:bg-gray-200 dark:hover:bg-gray-900 text-sm font-noto-sans rounded`}
          >
            # {channel.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default PublicChatList
