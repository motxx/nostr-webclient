import React from 'react'
import { FiGrid, FiList, FiMap, FiFilter } from 'react-icons/fi'
import { BsPersonFill, BsPeopleFill, BsGlobe } from 'react-icons/bs'
import ExploreMetrics from './ExploreMetrics'
import ExploreLanguageFilter from './ExploreLanguageFilter'
import Button from '@/components/ui-elements/Button'
import FilterButton from '@/components/ui-parts/FilterButton'
import { ExploreMetricWithNull } from '../types'

interface ExploreFiltersProps {
  accountFilter: string
  setAccountFilter: (filter: string) => void
  outputFormat: string
  setOutputFormat: (format: string) => void
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  metric: ExploreMetricWithNull
  setMetric: (metric: ExploreMetricWithNull) => void
  sortByMetric: boolean
  setSortByMetric: (sort: boolean) => void
  timeframe: string
  setTimeframe: (timeframe: string) => void
  languageGroupFilter: string
  setLanguageGroupFilter: (language: string) => void
}

const ExploreFilters: React.FC<ExploreFiltersProps> = ({
  accountFilter,
  setAccountFilter,
  outputFormat,
  setOutputFormat,
  showFilters,
  setShowFilters,
  metric,
  setMetric,
  sortByMetric,
  setSortByMetric,
  timeframe,
  setTimeframe,
  languageGroupFilter,
  setLanguageGroupFilter,
}) => {
  const handleAccountFilterChange = (filter: string) => setAccountFilter(filter)
  const handleOutputFormatChange = (format: string) => setOutputFormat(format)
  const handleSortByMetricChange = () => {
    const nextSortByMetric = !sortByMetric
    if (nextSortByMetric) {
      setMetric('engagement')
    } else {
      setMetric(null)
    }
    setSortByMetric(nextSortByMetric)
  }

  return (
    <div className="flex flex-wrap items-center">
      <div className="flex flex-wrap items-center mt-2 mr-4">
        <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
          アカウント:
        </label>
        <div className="grid grid-cols-3 gap-2">
          <FilterButton
            onClick={() => handleAccountFilterChange('all')}
            active={accountFilter === 'all'}
            icon={<BsGlobe />}
          />
          <FilterButton
            onClick={() => handleAccountFilterChange('follow')}
            active={accountFilter === 'follow'}
            icon={<BsPersonFill />}
          />
          <FilterButton
            onClick={() => handleAccountFilterChange('follow-of-follow')}
            active={accountFilter === 'follow-of-follow'}
            icon={<BsPeopleFill />}
          />
        </div>
      </div>
      <div className="flex flex-wrap items-center mt-2 mr-4">
        <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
          表示:
        </label>
        <div className="grid grid-cols-3 gap-2">
          <FilterButton
            onClick={() => handleOutputFormatChange('timeline')}
            active={outputFormat === 'timeline'}
            icon={<FiList />}
          />
          <FilterButton
            onClick={() => handleOutputFormatChange('image-grid')}
            active={outputFormat === 'image-grid'}
            icon={<FiGrid />}
          />
          <FilterButton
            onClick={() => handleOutputFormatChange('influence-map')}
            active={outputFormat === 'influence-map'}
            icon={<FiMap />}
          />
        </div>
      </div>
      <Button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center justify-center mt-2 bg-blue-500 text-white text-xs rounded-full"
      >
        <FiFilter className="mr-2" />
        詳細フィルタ
      </Button>
      {showFilters && (
        <div className="flex flex-wrap items-center">
          <ExploreMetrics
            metric={metric}
            setMetric={setMetric}
            sortByMetric={sortByMetric}
            handleSortByMetricChange={handleSortByMetricChange}
          />
          <div className="flex flex-wrap items-center mr-8">
            <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
              タイムスタンプ:
            </label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="p-1 bg-gray-200 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-full"
            >
              <option value="24h">24h</option>
              <option value="1week">1week</option>
              <option value="1month">1month</option>
              <option value="all">All</option>
            </select>
          </div>
          <ExploreLanguageFilter
            languageGroupFilter={languageGroupFilter}
            setLanguageGroupFilter={setLanguageGroupFilter}
          />
        </div>
      )}
    </div>
  )
}

export default ExploreFilters
