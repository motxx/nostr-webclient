import React from 'react'
import {
  MdTrendingUp,
  MdFavorite,
  MdRepeat,
  MdBolt,
  MdPeople,
} from 'react-icons/md'
import { FaToggleOff, FaToggleOn } from 'react-icons/fa'
import FilterButton from '@/components/ui-parts/FilterButton'
import { ExploreMetric, ExploreMetricWithNull } from '../types'

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
  const handleMetricChange = (newMetric: ExploreMetric) => {
    if (sortByMetric) {
      setMetric(newMetric)
    }
  }

  const metricButtons = [
    { metric: 'engagement', icon: <MdTrendingUp />, label: 'Engagement' },
    { metric: 'reposts', icon: <MdRepeat />, label: 'Reposts' },
    { metric: 'likes', icon: <MdFavorite />, label: 'Likes' },
    { metric: 'zaps', icon: <MdBolt />, label: 'Zaps' },
    { metric: 'followers', icon: <MdPeople />, label: 'Followers' },
  ] as const

  return (
    <div className="flex flex-wrap items-center mr-8">
      <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
        評価指標:
      </label>
      <button
        onClick={handleSortByMetricChange}
        className="flex items-center justify-center p-2 m-1 focus:outline-none"
        aria-label={
          sortByMetric ? 'Disable metric sorting' : 'Enable metric sorting'
        }
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
      </button>
      <div className="grid grid-cols-5 gap-2">
        {metricButtons.map(({ metric: buttonMetric, icon, label }) => (
          <FilterButton
            key={buttonMetric}
            onClick={() => handleMetricChange(buttonMetric)}
            active={metric === buttonMetric}
            icon={icon}
            disabled={!sortByMetric}
            aria-label={`Sort by ${label}`}
          />
        ))}
      </div>
    </div>
  )
}

export default ExploreMetrics
