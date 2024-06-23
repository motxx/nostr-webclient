import React, { useRef, useCallback } from 'react'
import TimelineStandard from '@/components/Timeline/TimelineStandard'
import ImageCarousel from '@/components/ui-parts/ImageCarousel'
import { mockImages, mockMerchants, mockPaidContents } from '../types'
import { User } from '@/domain/entities/User'
import { useInfiniteNotes } from '@/components/Timeline/hooks/useInfiniteNotes'

interface UserContentsProps {
  user: User
  toggleFollow: (userId: string) => boolean
}

const UserContents: React.FC<UserContentsProps> = ({ user, toggleFollow }) => {
  const { notes, isLoading, isLoadingMore, loadMoreNotes } = useInfiniteNotes({
    authorPubkeys: [user.pubkey],
  })
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const scrollElement = containerRef.current
    if (scrollElement) {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement
      if (scrollHeight - scrollTop <= clientHeight * 1.5) {
        loadMoreNotes()
      }
    }
  }, [loadMoreNotes])

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="w-full space-y-12 overflow-y-auto max-h-[calc(100vh-100px)]"
    >
      <div className="max-w-3xl mx-auto">
        {notes.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 ml-2">ピクチャー</h2>
            <ImageCarousel items={mockImages} />
          </div>
        )}
        {mockPaidContents.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 ml-2">販売コンテンツ</h2>
            <ImageCarousel items={mockPaidContents} />
          </div>
        )}
        {mockMerchants.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-4 ml-2">グッズ</h2>
            <ImageCarousel items={mockMerchants} />
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold mb-8 ml-2">ノート</h2>
          <TimelineStandard notes={notes} onToggleFollow={toggleFollow} />
        </div>
        {(isLoading || isLoadingMore) && (
          <div className="flex justify-center items-center h-16">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserContents
