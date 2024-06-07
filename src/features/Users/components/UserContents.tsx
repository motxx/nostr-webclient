import { User } from '@/models/user'
import TimelineStandard from '@/components/Timeline/TimelineStandard'
import { posts as mockAllPosts } from '@/data/dummy-posts'
import ImageCarousel from '@/components/ui-parts/ImageCarousel'
import { mockImages, mockMerchants, mockPaidContents } from '../types'

interface UserContentsProps {
  user: User
  toggleFollow: (userId: string) => boolean
}

const UserContents: React.FC<UserContentsProps> = ({ user, toggleFollow }) => {
  const posts = mockAllPosts.filter(
    (post) => post.userId === user.nostrAddress || post.userId === user.npub
  )

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 sm:px-8">
      {mockAllPosts.length > 0 && (
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
          <TimelineStandard posts={posts} onToggleFollow={toggleFollow} />
        </div>
      </div>
    </div>
  )
}

export default UserContents
