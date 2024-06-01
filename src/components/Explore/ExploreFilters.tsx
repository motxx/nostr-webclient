import React from 'react'
import { FiGrid, FiList, FiMap, FiFilter } from 'react-icons/fi'
import { BsPersonFill, BsPeopleFill, BsGlobe } from 'react-icons/bs'
import ExploreMetrics from './ExploreMetrics'
import ExploreLanguageFilter from './ExploreLanguageFilter'
import { ExploreMetricWithNull } from '../../pages/ExplorePage'

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
  const handleAccountFilterChange = (filter: string) => {
    setAccountFilter(filter)
  }

  const handleOutputFormatChange = (format: string) => {
    setOutputFormat(format)
  }

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
    <div>
      <div className="flex flex-wrap items-center">
        <div className="flex flex-wrap items-center space-x-2 mt-2 mr-4">
          <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
            アカウント:
          </label>
          <button
            onClick={() => handleAccountFilterChange('all')}
            className={`p-2 flex items-center justify-center ${accountFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
          >
            <BsGlobe />
          </button>
          <button
            onClick={() => handleAccountFilterChange('follow')}
            className={`p-2 flex items-center justify-center ${accountFilter === 'follow' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
          >
            <BsPersonFill />
          </button>
          <button
            onClick={() => handleAccountFilterChange('follow-of-follow')}
            className={`p-2 flex items-center justify-center ${accountFilter === 'follow-of-follow' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
          >
            <BsPeopleFill />
          </button>
        </div>
        <div className="flex flex-wrap items-center mt-2 mr-4">
          <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
            表示:
          </label>
          <div className="flex flex-wrap items-center">
            <div className="space-x-2">
              <button
                onClick={() => handleOutputFormatChange('timeline')}
                className={`p-2 ${outputFormat === 'timeline' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
              >
                <FiList />
              </button>
              <button
                onClick={() => handleOutputFormatChange('image-grid')}
                className={`p-2 ${outputFormat === 'image-grid' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
              >
                <FiGrid />
              </button>
              <button
                onClick={() => handleOutputFormatChange('influence-map')}
                className={`p-2 ${outputFormat === 'influence-map' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
              >
                <FiMap />
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center h-8 px-2 mt-2 bg-blue-500 text-white text-sm rounded-full"
        >
          <FiFilter className="mr-2" />
          詳細フィルタ
        </button>
      </div>
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
