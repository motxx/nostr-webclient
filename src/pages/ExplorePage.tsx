import React, { useState } from 'react'
import SearchBar from '../components/ui-parts/SearchBar'
import Widgets from '../components/Widgets/Widgets'
import ExploreFilters from '../components/Explore/ExploreFilters'
import ExploreOutput from '../components/Explore/ExploreOutput'
import { posts } from '../data/dummy-posts'

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

  const handleFinalSearch = (term: string) => {
    setFinalSearchTerm(term)
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

  return (
    <div className="flex flex-col lg:flex-row justify-center">
      <div className="flex-1 overflow-y-auto hide-scrollbar max-h-screen">
        <div className="sticky top-0 z-10 bg-white dark:bg-black p-4 sm:pb-4">
          <div className="mb-2">
            <SearchBar onSearch={handleFinalSearch} />
          </div>
          <ExploreFilters
            accountFilter={accountFilter}
            setAccountFilter={setAccountFilter}
            outputFormat={outputFormat}
            setOutputFormat={setOutputFormat}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            metric={metric}
            setMetric={setMetric}
            sortByMetric={sortByMetric}
            setSortByMetric={setSortByMetric}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            languageGroupFilter={languageGroupFilter}
            setLanguageGroupFilter={setLanguageGroupFilter}
          />
        </div>
        <div className="flex items-center justify-center">
          <ExploreOutput
            outputFormat={outputFormat}
            sortedPosts={sortedPosts}
            metric={metric}
          />
        </div>
      </div>
      <div className="hidden lg:block w-1/3 min-w-[280px] max-w-[500px] py-4 overflow-y-auto hide-scrollbar max-h-screen">
        <Widgets />
      </div>
    </div>
  )
}

export default ExplorePage
