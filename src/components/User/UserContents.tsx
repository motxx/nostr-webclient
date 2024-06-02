import { User } from '../../models/user'
import TimelineStandard from '../Timeline/TimelineStandard'
import { posts as mockAllPosts } from '../../data/dummy-posts'
import ImageCarousel from '../common/ImageCarousel'

interface UserContentsProps {
  user: User
  toggleFollow: (userId: string) => boolean
}

const mockImages = [
  'https://fastly.picsum.photos/id/274/300/200.jpg?hmac=7bAwaFltG7_ocjXC8PfJHYE_kKSMBL1OuBk7kfClu9w',
  'https://fastly.picsum.photos/id/756/300/200.jpg?hmac=ppa_nag_8FNw-XRBiUN1cfftQ63aZJXiGlM_qkz5eGc',
  'https://fastly.picsum.photos/id/989/300/200.jpg?hmac=j2uYVYvbBugBbTY0qh5jKViUaitkclMfWZ3G7Ily5nA',
]

const UserContents: React.FC<UserContentsProps> = ({ user, toggleFollow }) => {
  const posts = mockAllPosts.filter(
    (post) => post.userId === user.nostrAddress || post.userId === user.npub
  )
  const imagePosts = posts.filter(
    (post) => post.mediaType && post.mediaType === 'image' && post.mediaUrl
  )

  return (
    <div className="mt-10 w-full max-w-2xl mx-auto">
      {imagePosts.length > 0 && (
        <>
          <h2 className="text-lg font-bold mb-4">ピクチャー</h2>
          <ImageCarousel images={mockImages} />
        </>
      )}
      <h2 className="text-lg font-bold mb-4">投稿</h2>
      <TimelineStandard posts={posts} onToggleFollow={toggleFollow} />
    </div>
  )
}

export default UserContents
