import React from 'react'
import { User } from '../../models/user'
import Widget from './Widget'

type Channel = {
  id: number
  name: string
  knownUsers: User[]
  recommendReason?: string
  channeldId: string
}

const WidgetRecommendedPublicChannel: React.FC = () => {
  const channels: Channel[] = [
    {
      id: 1,
      name: '何でも質問板@Nostr',
      knownUsers: [
        new User({
          npub: 'npubhogefuga',
          pubkey: 'pubhogefuga',
          name: 'julia',
          image: 'https://randomuser.me/api/portraits/women/1.jpg',
        }),
        new User({
          npub: 'npubhogefuga2',
          pubkey: 'pubhogefuga2',
          name: 'kaori',
          image: 'https://randomuser.me/api/portraits/women/2.jpg',
        }),
        new User({
          npub: 'npubhogefuga3',
          pubkey: 'pubhogefuga3',
          name: 'nostaro',
          image: 'https://randomuser.me/api/portraits/men/1.jpg',
        }),
      ],
      channeldId: 'https://channel1.example.com',
    },
    {
      id: 2,
      name: '好きなボカロを紹介するスレ',
      knownUsers: [
        new User({
          npub: 'npubhogefuga',
          pubkey: 'pubhogefuga',
          name: 'julia',
          image: 'https://randomuser.me/api/portraits/women/3.jpg',
        }),
        new User({
          npub: 'npubhogefuga2',
          pubkey: 'pubhogefuga2',
          name: 'kaori',
          image: 'https://randomuser.me/api/portraits/women/4.jpg',
        }),
      ],
      channeldId: 'https://channel2.example.com',
    },
    {
      id: 3,
      name: 'Bitcoin 101',
      knownUsers: [],
      recommendReason: '多数の著名なユーザーが参加しています',
      channeldId: 'https://channel3.example.com',
    },
  ]

  return (
    <Widget topic="おすすめの公開チャンネル">
      {channels.map((channel) => (
        <div
          key={channel.id}
          className="flex items-center justify-between py-2 border-b dark:border-gray-600"
        >
          <div className="flex items-center space-x-4">
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {channel.name}
              </div>
              {channel.knownUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2 mt-1">
                    {channel.knownUsers.map((user, index) => (
                      <div
                        className="relative group w-[32px]"
                        key={index}
                        style={{ zIndex: channel.knownUsers.length - index }}
                      >
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 justify-center max-w-[150px] break-words">
                    <p className="truncate whitespace-pre-wrap line-clamp-2">
                      {channel.knownUsers.map((user: any, index: number) => {
                        if (index === 0) {
                          return `${user.name}さん`
                        }
                        return `、${user.name}さん`
                      })}
                      が参加しています
                    </p>
                  </div>
                </div>
              )}
              {channel.knownUsers.length === 0 && channel.recommendReason && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {channel.recommendReason}
                </div>
              )}
            </div>
          </div>
          <button className="bg-white text-black text-sm font-noto-sans py-1 px-2 rounded-full min-w-16 hover:bg-gray-50 transition">
            参加
          </button>
        </div>
      ))}
      <div className="text-blue-500 dark:text-blue-300 hover:underline cursor-pointer mt-4">
        さらに表示
      </div>
    </Widget>
  )
}

export default WidgetRecommendedPublicChannel
