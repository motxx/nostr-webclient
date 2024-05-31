import React, { useState } from 'react'
import TimelineStandard from '../components/Timeline/TimelineStandard'
import TimelineImageGrid from '../components/Timeline/TimelineImageGrid'
import ExploreUserInfluenceGraph from '../components/Explore/ExploreUserInfluenceGraph'
import SearchBar from '../components/common/SearchBar'
import { posts } from '../data/dummy-posts'
import { FiGrid, FiList, FiMap, FiFilter } from 'react-icons/fi'
import { BsPersonFill, BsPeopleFill, BsGlobe } from 'react-icons/bs'
import {
  MdTrendingUp,
  MdFavorite,
  MdRepeat,
  MdBolt,
  MdPeople,
} from 'react-icons/md'
import { FaToggleOff, FaToggleOn } from 'react-icons/fa'
import Widgets from '../components/Widgets/Widgets'

export type ExploreMetric =
  | 'engagement'
  | 'reposts'
  | 'likes'
  | 'zaps'
  | 'followers'

export type ExploreMetricWithNull = ExploreMetric | null

const ExplorePage: React.FC = () => {
  const [accountFilter, setAccountFilter] = useState('all')
  const [metric, setMetric] = useState(null as ExploreMetricWithNull)
  const [timeframe, setTimeframe] = useState('all')
  const [outputFormat, setOutputFormat] = useState('timeline')
  const [showFilters, setShowFilters] = useState(false)
  const [sortByMetric, setSortByMetric] = useState(false)
  const [finalSearchTerm, setFinalSearchTerm] = useState('')
  const [languageGroupFilter, setLanguageGroupFilter] = useState('all')

  const handleAccountFilterChange = (filter: string) => {
    setAccountFilter(filter)
  }

  const handleMetricChange = (filter: ExploreMetric) => {
    setMetric(filter)
  }

  const handleTimeframeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setTimeframe(event.target.value)
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

  const handleFinalSearch = (term: string) => {
    setFinalSearchTerm(term)
  }

  const handleLanguageGroupFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLanguageGroupFilter(event.target.value)
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearchTerm = post.content.includes(finalSearchTerm)
    const matchesAccountFilter =
      accountFilter === 'all' || post.accountType === accountFilter
    const matchesTimeframe = true // Implement your timeframe filtering logic here
    const matchesLanguageGroupFilter =
      languageGroupFilter === 'all' ||
      post.languageGroup === languageGroupFilter
    return (
      matchesSearchTerm &&
      matchesAccountFilter &&
      matchesTimeframe &&
      matchesLanguageGroupFilter
    )
  })

  const sortedPosts =
    sortByMetric && metric
      ? filteredPosts.sort((a, b) => b[metric] - a[metric])
      : filteredPosts

  const renderOutput = () => {
    switch (outputFormat) {
      case 'timeline':
        return <TimelineStandard posts={sortedPosts} />
      case 'image-grid':
        return <TimelineImageGrid posts={sortedPosts} />
      case 'influence-map':
        return (
          <ExploreUserInfluenceGraph
            hashtags={[]}
            metric={metric || 'followers'}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col lg:flex-row justify-center sm:p-4">
      <div className="flex-1">
        <div className="p-4 sm:p-0">
          <div className="mb-2">
            <SearchBar onSearch={handleFinalSearch} />
          </div>
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
              <div className="flex flex-wrap items-center mr-8">
                <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                  タイムスタンプ:
                </label>
                <select
                  value={timeframe}
                  onChange={handleTimeframeChange}
                  className="p-1 bg-gray-200 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-full"
                >
                  <option value="24h">24h</option>
                  <option value="1week">1week</option>
                  <option value="1month">1month</option>
                  <option value="all">All</option>
                </select>
              </div>
              <div className="flex flex-wrap items-center">
                <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
                  言語圏:
                </label>
                <select
                  value={languageGroupFilter}
                  onChange={handleLanguageGroupFilterChange}
                  className="p-1 bg-gray-200 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-full"
                >
                  <option value="all">グローバル</option>
                  <option value="english">英語圏</option>
                  <option value="japanese">日本語</option>
                  <option value="spanish">スペイン語圏</option>
                  <option value="chinese">中国語圏</option>
                  <option value="hindi">ヒンディー語圏</option>
                  <option value="arabic">アラビア語圏</option>
                  <option value="portuguese">ポルトガル語圏</option>
                  <option value="russian">ロシア語圏</option>
                  <option value="french">フランス語圏</option>
                  <option value="german">ドイツ語圏</option>
                  {/* Add more language groups as needed */}
                </select>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center justify-center">
          {renderOutput()}
        </div>
      </div>
      <div className="hidden lg:block w-1/3 min-w-[280px] max-w-[500px] ml-4">
        <div
          className="hidden lg:flex flex-col space-y-4 overflow-y-auto hide-scrollbar"
          style={{ maxHeight: '100vh' }}
        >
          <Widgets />
        </div>
      </div>
    </div>
  )
}

export default ExplorePage
