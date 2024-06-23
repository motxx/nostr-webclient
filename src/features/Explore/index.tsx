import React, { useState, useRef, useCallback, useMemo } from 'react'
import SearchBar from '@/components/ui-parts/SearchBar'
import Widgets from '@/components/Widgets/Widgets'
import ExploreFilters from './components/ExploreFilters'
import ExploreOutput from './components/ExploreOutput'
import { ExploreMetricWithNull } from './types'
import { useInfiniteNotes } from '@/components/Timeline/hooks/useInfiniteNotes'

const ExplorePage: React.FC = () => {
  const [accountFilter, setAccountFilter] = useState('all')
  const [metric, setMetric] = useState(null as ExploreMetricWithNull)
  const [timeframe, setTimeframe] = useState('all')
  const [outputFormat, setOutputFormat] = useState('timeline')
  const [showFilters, setShowFilters] = useState(false)
  const [sortByMetric, setSortByMetric] = useState(false)
  const [finalSearchTerm, setFinalSearchTerm] = useState('')
  const [languageGroupFilter, setLanguageGroupFilter] = useState('all')

  const wrapperRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const { notes, isLoading, isLoadingMore, loadMoreNotes } = useInfiniteNotes({
    limit: 20,
  })

  const handleFinalSearch = (term: string) => {
    setFinalSearchTerm(term)
  }

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearchTerm = note.text
        .toLowerCase()
        .includes(finalSearchTerm.toLowerCase())
      const matchesAccountFilter =
        accountFilter === 'all' || note.accountType === accountFilter
      const matchesTimeframe = true // Implement your timeframe filtering logic here
      const matchesLanguageGroupFilter =
        languageGroupFilter === 'all' ||
        note.languageGroup === languageGroupFilter
      return (
        matchesSearchTerm &&
        matchesAccountFilter &&
        matchesTimeframe &&
        matchesLanguageGroupFilter
      )
    })
  }, [notes, finalSearchTerm, accountFilter, languageGroupFilter])

  const sortedNotes = useMemo(() => {
    if (sortByMetric && metric) {
      return [...filteredNotes].sort((a, b) => b[metric] - a[metric])
    }
    return filteredNotes
  }, [filteredNotes, sortByMetric, metric])

  const handleScroll = useCallback(() => {
    const wrapperElement = wrapperRef.current
    const scrollElement = timelineRef.current
    if (wrapperElement && scrollElement) {
      const currentScrollTop = scrollElement.scrollTop
      const scrollHeight = scrollElement.scrollHeight
      const clientHeight = wrapperElement.clientHeight

      if (
        !isLoading &&
        !isLoadingMore &&
        scrollHeight - currentScrollTop <= clientHeight * 1.5
      ) {
        loadMoreNotes()
      }
    }
  }, [isLoading, isLoadingMore, loadMoreNotes])

  return (
    <div
      ref={wrapperRef}
      className="flex flex-col lg:flex-row justify-center h-full"
    >
      <div
        ref={timelineRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto hide-scrollbar max-h-screen"
      >
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
            sortedNotes={sortedNotes}
            metric={metric}
          />
        </div>
        {(isLoading || isLoadingMore) && (
          <div className="flex justify-center items-center h-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        )}
      </div>
      <div className="hidden lg:block w-1/3 min-w-[280px] max-w-[500px] py-4 overflow-y-auto hide-scrollbar max-h-screen">
        <Widgets />
      </div>
    </div>
  )
}

export default ExplorePage
