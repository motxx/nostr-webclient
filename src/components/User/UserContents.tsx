import { User } from '../../models/user'
import TimelineStandard from '../Timeline/TimelineStandard'
import { posts as mockPosts } from '../../data/dummy-posts'

interface UserContentsProps {
  user: User
  toggleFollow: (userId: string) => boolean
}

const UserContents: React.FC<UserContentsProps> = ({ user, toggleFollow }) => {
  const userPosts = mockPosts.filter(
    (post) => post.userId === user.nostrAddress || post.userId === user.npub
  )
  return (
    <div className="mt-10 w-full max-w-2xl mx-auto">
      <h2 className="text-lg font-bold mb-4">投稿</h2>
      <TimelineStandard posts={userPosts} onToggleFollow={toggleFollow} />
    </div>
  )
}

export default UserContents
