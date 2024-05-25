import React from 'react'

type Channel = {
  id: number
  name: string
  description?: string
  channeldId: string
}

const RecommendedPublicChannel: React.FC = () => {
  const channels: Channel[] = [
    {
      id: 1,
      name: '何でも質問板@Nostr',
      description: 'Nostr初心者の質問に玄人が答えます',
      channeldId: 'https://channel1.example.com',
    },
    {
      id: 2,
      name: '好きなボカロを紹介するスレ',
      channeldId: 'https://channel2.example.com',
    },
    {
      id: 3,
      name: '◯◯さん応援スレ',
      channeldId: 'https://channel3.example.com',
    },
  ]

  return (
    <div className="hidden md:block w-full p-6">
      <div className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-300 font-mplus-2">
        おすすめの公開チャンネル
      </div>
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
              {channel.description && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {channel.description}
                </div>
              )}
              <div className="text-sm text-blue-500 dark:text-blue-300">
                {channel.channeldId}
              </div>
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
    </div>
  )
}

export default RecommendedPublicChannel
