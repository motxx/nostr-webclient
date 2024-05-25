import React from 'react'

const Trends: React.FC = () => {
  const trends = [
    { id: 1, topic: '#reactjs', count: 1200 },
    { id: 2, topic: '#tailwindcss', count: 800 },
  ]

  return (
    <div className="hidden md:block w-full">
      <div className="bg-white dark:bg-black p-6 rounded-lg transition hover:shadow-lg">
        <div className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-300 font-noto-sans">
          トレンド
        </div>
        <div>
          {trends.map((trend) => (
            <div
              key={trend.id}
              className="flex justify-between items-center py-2 border-b dark:border-gray-600"
            >
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {trend.topic}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {trend.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Trends
