import { User } from '@/models/user'
import TimelineStandard from '@/components/Timeline/TimelineStandard'
import { posts as mockAllPosts } from '@/data/dummy-posts'
import ImageCarousel from '@/components/ui-parts/ImageCarousel'

interface UserContentsProps {
  user: User
  toggleFollow: (userId: string) => boolean
}

const mockImages = [
  'https://fastly.picsum.photos/id/274/300/200.jpg?hmac=7bAwaFltG7_ocjXC8PfJHYE_kKSMBL1OuBk7kfClu9w',
  'https://fastly.picsum.photos/id/549/2000/1000.jpg?hmac=ynmBAnvLsXoHfV9PM9t9GhZXfx6M_p5KXi7BmuqSluU',
  'https://fastly.picsum.photos/id/756/300/200.jpg?hmac=ppa_nag_8FNw-XRBiUN1cfftQ63aZJXiGlM_qkz5eGc',
  'https://fastly.picsum.photos/id/499/1000/2000.jpg?hmac=76SSf6avuWKleAwQ6UhOUROdWQVycs_5ucmQ8FgQhRk',
  'https://fastly.picsum.photos/id/989/300/200.jpg?hmac=j2uYVYvbBugBbTY0qh5jKViUaitkclMfWZ3G7Ily5nA',
  'https://fastly.picsum.photos/id/482/400/600.jpg?hmac=UmzILUDe8zb6mEeyMK2Nnpv4VOyhfNhSk2QmR-8KCLY',
]

const UserContents: React.FC<UserContentsProps> = ({ user, toggleFollow }) => {
  const posts = mockAllPosts.filter(
    (post) => post.userId === user.nostrAddress || post.userId === user.npub
  )
  const imagePosts = posts.filter(
    (post) => post.mediaType && post.mediaType === 'image' && post.mediaUrl
  )

  return (
    <div className="w-full max-w-3xl mx-auto space-y-12 sm:px-8">
      {imagePosts.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4 ml-2">ピクチャー</h2>
          <ImageCarousel images={mockImages} />
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
