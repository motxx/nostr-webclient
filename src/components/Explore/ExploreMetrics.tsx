import React from 'react'
import {
  MdTrendingUp,
  MdFavorite,
  MdRepeat,
  MdBolt,
  MdPeople,
} from 'react-icons/md'
import { FaToggleOff, FaToggleOn } from 'react-icons/fa'
import { ExploreMetric, ExploreMetricWithNull } from '../../pages/ExplorePage'
import FilterButton from '../ui-parts/FilterButton'

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
  const handleMetricChange = (metric: ExploreMetric) => setMetric(metric)

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
      <div className="grid grid-cols-5 gap-2">
        <FilterButton
          onClick={() => handleMetricChange('engagement')}
          active={metric === 'engagement'}
          icon={<MdTrendingUp />}
          disabled={!sortByMetric}
        />
        <FilterButton
          onClick={() => handleMetricChange('reposts')}
          active={metric === 'reposts'}
          icon={<MdRepeat />}
          disabled={!sortByMetric}
        />
        <FilterButton
          onClick={() => handleMetricChange('likes')}
          active={metric === 'likes'}
          icon={<MdFavorite />}
          disabled={!sortByMetric}
        />
        <FilterButton
          onClick={() => handleMetricChange('zaps')}
          active={metric === 'zaps'}
          icon={<MdBolt />}
          disabled={!sortByMetric}
        />
        <FilterButton
          onClick={() => handleMetricChange('followers')}
          active={metric === 'followers'}
          icon={<MdPeople />}
          disabled={!sortByMetric}
        />
      </div>
    </div>
  )
}

export default ExploreMetrics
