import React from 'react'
import { Sparklines, SparklinesLine, SparklinesSpots } from 'react-sparklines'

const Trends: React.FC = () => {
  const trends = [
    { id: 1, topic: '#reactjs', scores: [500, 600, 700, 800, 1200] },
    { id: 2, topic: '#tailwindcss', scores: [200, 300, 400, 600, 800] },
  ]

  const sortedTrends = trends.sort(
    (a, b) => b.scores[b.scores.length - 1] - a.scores[a.scores.length - 1]
  )

  return (
    <div className="hidden md:block w-full px-6 py-4">
      <div className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-300 font-mplus-2">
        トレンド
      </div>
      <div>
        {sortedTrends.map((trend) => (
          <div key={trend.id} className="py-2 border-b dark:border-gray-600">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {trend.topic}
              </span>
              <div className="w-32">
                <Sparklines
                  data={trend.scores}
                  style={{ backgroundColor: 'transparent' }}
                >
                  <SparklinesLine
                    color={
                      trend.scores[trend.scores.length - 1] > trend.scores[0]
                        ? 'lime'
                        : 'red'
                    }
                    style={{ strokeWidth: 2 }}
                  />
                  <SparklinesSpots
                    size={4}
                    style={{
                      fill:
                        trend.scores[trend.scores.length - 1] > trend.scores[0]
                          ? 'lime'
                          : 'red',
                    }}
                  />
                </Sparklines>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Trends
