import React, { useState } from 'react'
import TimelineStandard from '../components/Timeline/TimelineStandard'
import TimelineImageGrid from '../components/Timeline/TimelineImageGrid'
import ExploreUserInfluenceGraph from '../components/Explore/ExploreUserInfluenceGraph'
import SearchBar from '../components/common/SearchBar'
import { posts } from '../data/dummy-posts'
import { FiGrid, FiList, FiMap, FiFilter } from 'react-icons/fi'
import { BsPersonFill, BsPeopleFill, BsGlobe } from 'react-icons/bs'
import { RiUserFollowFill } from 'react-icons/ri'
import { MdTrendingUp, MdFavorite, MdRepeat, MdBolt } from 'react-icons/md'
import { FaToggleOff, FaToggleOn } from 'react-icons/fa'

const ExplorePage: React.FC = () => {
  const [accountFilter, setAccountFilter] = useState('all')
  const [metric, setMetric] = useState('engagement')
  const [timeframe, setTimeframe] = useState('all')
  const [outputFormat, setOutputFormat] = useState('timeline')
  const [showFilters, setShowFilters] = useState(false)
  const [sortByMetric, setSortByMetric] = useState(false)
  const [finalSearchTerm, setFinalSearchTerm] = useState('')

  const handleAccountFilterChange = (filter: string) => {
    setAccountFilter(filter)
  }

  const handleMetricChange = (filter: string) => {
    setMetric(filter)
  }

  const handleTimeframeChange = (filter: string) => {
    setTimeframe(filter)
  }

  const handleOutputFormatChange = (format: string) => {
    setOutputFormat(format)
  }

  const handleSortByMetricChange = () => {
    const nextSortByMetric = !sortByMetric
    if (nextSortByMetric) {
      setMetric('engagement')
    } else {
      setMetric('')
    }
    setSortByMetric(nextSortByMetric)
  }

  const handleFinalSearch = (term: string) => {
    setFinalSearchTerm(term)
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearchTerm = post.content.includes(finalSearchTerm)
    const matchesAccountFilter =
      accountFilter === 'all' || post.accountType === accountFilter
    const matchesTimeframe = true // Implement your timeframe filtering logic here
    return matchesSearchTerm && matchesAccountFilter && matchesTimeframe
  })

  const sortedPosts = sortByMetric
    ? filteredPosts.sort((a, b) => b[metric] - a[metric])
    : filteredPosts

  const renderOutput = () => {
    switch (outputFormat) {
      case 'timeline':
        return <TimelineStandard posts={sortedPosts} />
      case 'image-grid':
        return <TimelineImageGrid posts={sortedPosts} />
      case 'influence-map':
        return <ExploreUserInfluenceGraph />
      default:
        return null
    }
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">
        探索ページ
      </h3>
      <div className="mb-4">
        <SearchBar onSearch={handleFinalSearch} />
      </div>
      <div className="flex flex-wrap items-center space-x-4">
        <div className="flex flex-wrap items-center">
          <label className="mr-2 text-gray-700 dark:text-gray-300">
            アカウント:
          </label>
          <button
            onClick={() => handleAccountFilterChange('all')}
            className={`p-2 m-1 flex items-center justify-center ${accountFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
          >
            <BsGlobe />
          </button>
          <button
            onClick={() => handleAccountFilterChange('follow')}
            className={`p-2 m-1 flex items-center justify-center ${accountFilter === 'follow' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
          >
            <BsPersonFill />
          </button>
          <button
            onClick={() => handleAccountFilterChange('follow-of-follow')}
            className={`p-2 m-1 flex items-center justify-center ${accountFilter === 'follow-of-follow' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
          >
            <RiUserFollowFill />
          </button>
          <button
            onClick={() => handleAccountFilterChange('region')}
            className={`p-2 m-1 flex items-center justify-center ${accountFilter === 'region' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
          >
            <BsPeopleFill />
          </button>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center justify-center h-8 px-2 bg-blue-500 text-white text-sm rounded-full"
        >
          <FiFilter className="mr-2" />
          詳細フィルタ設定
        </button>
      </div>
      {showFilters && (
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-wrap items-center">
            <label className="mr-2 text-gray-700 dark:text-gray-300">
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
          </div>
          <div className="flex flex-wrap items-center">
            <label className="mr-2 text-gray-700 dark:text-gray-300">
              タイムスタンプ:
            </label>
            <button
              onClick={() => handleTimeframeChange('24h')}
              className={`p-2 m-1 ${timeframe === '24h' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
            >
              24h
            </button>
            <button
              onClick={() => handleTimeframeChange('1week')}
              className={`p-2 m-1 ${timeframe === '1week' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
            >
              1week
            </button>
            <button
              onClick={() => handleTimeframeChange('1month')}
              className={`p-2 m-1 ${timeframe === '1month' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
            >
              1month
            </button>
            <button
              onClick={() => handleTimeframeChange('all')}
              className={`p-2 m-1 ${timeframe === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
            >
              All
            </button>
          </div>
          <div className="flex flex-wrap items-center md:col-span-2">
            <label className="mr-2 text-gray-700 dark:text-gray-300">
              出力形式:
            </label>
            <button
              onClick={() => handleOutputFormatChange('timeline')}
              className={`p-2 m-1 ${outputFormat === 'timeline' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
            >
              <FiList />
            </button>
            <button
              onClick={() => handleOutputFormatChange('image-grid')}
              className={`p-2 m-1 ${outputFormat === 'image-grid' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
            >
              <FiGrid />
            </button>
            <button
              onClick={() => handleOutputFormatChange('influence-map')}
              className={`p-2 m-1 ${outputFormat === 'influence-map' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
            >
              <FiMap />
            </button>
          </div>
        </div>
      )}
      <div className="mt-4">{renderOutput()}</div>
    </div>
  )
}

export default ExplorePage
