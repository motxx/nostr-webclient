import React, { useState, useRef, useCallback, useMemo } from 'react'
import HashSearchBar from '@/components/ui-parts/HashSearchBar'
import Widgets from '@/components/Widgets/Widgets'
import ExploreFilters from './components/ExploreFilters'
import ExploreOutput from './components/ExploreOutput'
import { AccountFilter, ExploreMetricWithNull } from './types'
import { useInfiniteNotes } from '@/components/Timeline/hooks/useInfiniteNotes'
import { NoteType } from '@/domain/entities/Note'

const ExplorePage: React.FC = () => {
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('global')
  const [metric, setMetric] = useState<ExploreMetricWithNull>(null)
  const [timeframe, setTimeframe] = useState('all')
  const [outputFormat, setOutputFormat] = useState('timeline')
  const [showFilters, setShowFilters] = useState(false)
  const [sortByMetric, setSortByMetric] = useState(false)
  const [finalSearchTerm, setFinalSearchTerm] = useState('')
  const [languageGroupFilter, setLanguageGroupFilter] = useState('all')

  const wrapperRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  const { notes, isLoading, isLoadingMore, loadMoreNotes } = useInfiniteNotes({
    global: accountFilter === 'global',
    // TODO: Implement authorPubkeys when accountFilter === 'network'
    limit: 20,
  })

  const handleFinalSearch = (term: string, hashtags: string[]) => {
    // TODO: Implement hashtags search
    setFinalSearchTerm(term)
  }

  const detectLanguageGroup = (
    text: string,
    profile?: { name?: string; displayName?: string }
  ): string => {
    const content = (
      text +
      ' ' +
      (profile?.name || '') +
      ' ' +
      (profile?.displayName || '')
    ).toLowerCase()

    if (/[ぁ-んァ-ン]/.test(content)) return 'japanese'
    if (/[\u4e00-\u9fa5]/.test(content)) return 'chinese'
    if (/[а-яА-Я]/.test(content)) return 'russian'
    if (/[ا-ي]/.test(content)) return 'arabic'
    if (/[á-úñ]/.test(content)) return 'spanish'
    if (/[à-ùû]/.test(content)) return 'french'
    if (/[ß-öü]/.test(content)) return 'german'
    if (/[ã-õç]/.test(content)) return 'portuguese'
    if (/[देवनागरी]/.test(content)) return 'hindi'

    return 'english'
  }

  const filteredNotes = useMemo(() => {
    return notes.filter((note: NoteType) => {
      const matchesSearchTerm = note.text
        .toLowerCase()
        .includes(finalSearchTerm.toLowerCase())
      const matchesAccountFilter = accountFilter === 'global'
      const matchesTimeframe = true // TODO: Implement timeframe filtering logic

      const noteLanguageGroup = detectLanguageGroup(
        note.text,
        note.author.profile
      )
      const matchesLanguageGroupFilter =
        languageGroupFilter === 'all' ||
        noteLanguageGroup === languageGroupFilter

      return (
        matchesSearchTerm &&
        matchesAccountFilter &&
        matchesTimeframe &&
        matchesLanguageGroupFilter
      )
    })
  }, [notes, finalSearchTerm, accountFilter, languageGroupFilter])

  const calculateEngagement = (note: NoteType): number => {
    const repostsWeight = 2
    const likesWeight = 1
    const zapsWeight = 0.1

    return (
      (note.reactions.repostsCount ?? 0) * repostsWeight +
      (note.reactions.likesCount ?? 0) * likesWeight +
      (note.reactions.zapsAmount ?? 0) * zapsWeight
    )
  }

  const sortedNotes = useMemo(() => {
    if (sortByMetric && metric) {
      return [...filteredNotes].sort((a: NoteType, b: NoteType) => {
        if (metric === 'engagement') {
          return calculateEngagement(b) - calculateEngagement(a)
        }
        if (metric === 'followers') {
          return (
            (b.author.profile?.followersCount || 0) -
            (a.author.profile?.followersCount || 0)
          )
        }
        if (metric === 'zaps') {
          return (b.reactions.zapsAmount ?? 0) - (a.reactions.zapsAmount ?? 0)
        }
        return (
          ((b.reactions[
            `${metric}Count` as keyof NoteType['reactions']
          ] as number) ?? 0) -
          ((a.reactions[
            `${metric}Count` as keyof NoteType['reactions']
          ] as number) ?? 0)
        )
      })
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
            <HashSearchBar onSearch={handleFinalSearch} />
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
