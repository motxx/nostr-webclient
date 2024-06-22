import TimelineStandard from '@/components/Timeline/TimelineStandard'
import ImageCarousel from '@/components/ui-parts/ImageCarousel'
import { mockImages, mockMerchants, mockPaidContents } from '../types'
import { User } from '@/domain/entities/User'
import { useSubscribeNotes } from '@/components/Timeline/hooks/useSubscribeNotes'
import { NoteType } from '@/domain/entities/Note'
import { useEffect, useState } from 'react'

interface UserContentsProps {
  user: User
  toggleFollow: (userId: string) => boolean
}

const UserContents: React.FC<UserContentsProps> = ({ user, toggleFollow }) => {
  const { subscribe } = useSubscribeNotes()
  const [notes, setNotes] = useState<NoteType[]>([])
  useEffect(() => {
    subscribe(
      (note) => {
        setNotes((prev) => [...prev, note])
      },
      {
        authorPubkeys: [user.pubkey],
      }
    )
  }, [subscribe, user.pubkey])

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 sm:px-8">
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
        <div className="flex items-center justify-center">
          <TimelineStandard notes={notes} onToggleFollow={toggleFollow} />
        </div>
      </div>
    </div>
  )
}

export default UserContents
