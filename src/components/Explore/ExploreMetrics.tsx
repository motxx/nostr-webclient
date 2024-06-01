import React from 'react'
import {
  MdTrendingUp,
  MdFavorite,
  MdRepeat,
  MdBolt,
  MdPeople,
} from 'react-icons/md'
import { FaToggleOff, FaToggleOn } from 'react-icons/fa'
import { ExploreMetricWithNull } from '../../pages/ExplorePage'

interface ExploreMetricsProps {
  metric: ExploreMetricWithNull
  setMetric: (metric: ExploreMetricWithNull) => void
  sortByMetric: boolean
  handleSortByMetricChange: () => void
}

const ExploreMetrics: React.FC<ExploreMetricsProps> = ({
  metric,
  setMetric,
  sortByMetric,
  handleSortByMetricChange,
}) => {
  const handleMetricChange = (metric: ExploreMetric) => {
    setMetric(metric)
  }

  return (
    <div className="flex flex-wrap items-center mr-8">
      <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
        評価指標:
      </label>
      <div
        onClick={handleSortByMetricChange}
        className="flex items-center justify-center p-2 m-1"
      >
        {sortByMetric ? (
          <>
            <FaToggleOn className="text-xl text-green-500 mr-1" />
            <span className="text-xs font-mplus-2">ON</span>
          </>
        ) : (
          <>
            <FaToggleOff className="text-xl text-gray-400 dark:text-gray-500 mr-1" />
            <span className="text-xs font-mplus-2">OFF</span>
          </>
        )}
      </div>
      <button
        onClick={() => handleMetricChange('engagement')}
        disabled={!sortByMetric}
        className={`p-2 m-1 flex items-center justify-center ${metric === 'engagement' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
      >
        <MdTrendingUp />
      </button>
      <button
        onClick={() => handleMetricChange('reposts')}
        disabled={!sortByMetric}
        className={`p-2 m-1 flex items-center justify-center ${metric === 'reposts' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
      >
        <MdRepeat />
      </button>
      <button
        onClick={() => handleMetricChange('likes')}
        disabled={!sortByMetric}
        className={`p-2 m-1 flex items-center justify-center ${metric === 'likes' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
      >
        <MdFavorite />
      </button>
      <button
        onClick={() => handleMetricChange('zaps')}
        disabled={!sortByMetric}
        className={`p-2 m-1 flex items-center justify-center ${metric === 'zaps' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
      >
        <MdBolt />
      </button>
      <button
        onClick={() => handleMetricChange('followers')}
        disabled={!sortByMetric}
        className={`p-2 m-1 flex items-center justify-center ${metric === 'followers' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
      >
        <MdPeople />
      </button>
    </div>
  )
}

export default ExploreMetrics
