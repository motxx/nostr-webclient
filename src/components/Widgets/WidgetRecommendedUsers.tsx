import React from 'react'
import Widget from './Widget'

const WidgetRecommendedUsers: React.FC = () => {
  const users = [
    {
      id: 1,
      name: 'User One',
      username: '@userone',
      image: 'https://via.placeholder.com/50',
    },
    {
      id: 2,
      name: 'User Two',
      username: '@usertwo',
      image: 'https://via.placeholder.com/50',
    },
    {
      id: 3,
      name: 'User Three',
      username: '@userthree',
      image: 'https://via.placeholder.com/50',
    },
  ]

  return (
    <Widget topic="おすすめユーザー">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between py-2 border-b dark:border-gray-600"
        >
          <div className="flex items-center space-x-4">
            <img
              src={user.image}
              alt={user.name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-medium text-gray-700 dark:text-gray-300">
                {user.name}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {user.username}
              </div>
            </div>
          </div>
          <button className="bg-white text-black text-sm font-noto-sans py-1 px-2 rounded-full hover:bg-gray-50 transition">
            フォロー
          </button>
        </div>
      ))}
      <div className="text-blue-500 dark:text-blue-300 hover:underline cursor-pointer mt-4">
        さらに表示
      </div>
    </Widget>
  )
}

export default WidgetRecommendedUsers
