import React from 'react'

const RecommendedRelays: React.FC = () => {
  const relays = [
    {
      id: 1,
      name: 'Relay One',
      description: 'This is the first relay',
      url: 'wss://relay1.example.com',
    },
    {
      id: 2,
      name: 'Relay Two',
      description: 'This is the second relay',
      url: 'wss://relay2.example.com',
    },
    {
      id: 3,
      name: 'Relay Three',
      description: 'This is the third relay',
      url: 'wss://relay3.example.com',
    },
  ]

  return (
    <div className="hidden md:block w-full p-6">
      <div className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-300 font-mplus-2">
        おすすめのリレー
      </div>
      {relays.map((relay) => (
        <div
          key={relay.id}
          className="flex items-center justify-between py-2 border-b dark:border-gray-600"
        >
          <div className="flex items-center space-x-4">
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {relay.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {relay.description}
              </div>
              <div className="text-sm text-blue-500 dark:text-blue-300">
                {relay.url}
              </div>
            </div>
          </div>
          <button className="bg-white text-black text-sm font-noto-sans py-1 px-2 rounded-full hover:bg-gray-50 transition">
            接続
          </button>
        </div>
      ))}
      <div className="text-blue-500 dark:text-blue-300 hover:underline cursor-pointer mt-4">
        さらに表示
      </div>
    </div>
  )
}

export default RecommendedRelays
