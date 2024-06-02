import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { posts as mockPosts } from '../data/dummy-posts'
import { User } from '../models/user'
import TimelineStandard from '../components/Timeline/TimelineStandard'
import UserHeader from '../components/User/UserHeader'
import UserDescription from '../components/User/UserDescription'

interface UserPageProps {
  isFollowing: boolean
  toggleFollow: (userId: string) => boolean
}

const UserPage: React.FC<UserPageProps> = ({ isFollowing, toggleFollow }) => {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<User | null>(null)
  const userPosts = mockPosts.filter((post) => post.userId === userId)

  useEffect(() => {
    const fetchUserData = async () => {
      const mockUser = new User({
        npub: 'npub1v20e8yj9y7n58q5kfp0fahea9g4p3pmv2ufjgc6c9mcnugyeemyqu6s59g',
        pubkey:
          '629f93924527a7438296485e9edf3d2a2a18876c57132463582ef13e2099cec8',
        name: 'moti',
        nostrAddress: '_@motxx.pages.dev',
        image: 'https://randomuser.me/api/portraits/men/5.jpg',
        bio: 'This is a mock user bio.\nhttps://example.com#example',
        followersCount: 150,
        followingCount: 100,
        headerImage:
          'https://fastly.picsum.photos/id/227/600/200.jpg?hmac=iWKqkrS9xX7cgGWbiBCnAUzNtyCn8vpUBupjxwF3Lo8',
        links: {
          github: 'https://github.com/example',
          twitter: 'https://twitter.com/example',
          mastodon: 'https://mastodon.social/@example',
          telegram: 'https://t.me/example',
          bluesky: 'https://bsky.app/profile/example',
          pixiv: 'https://pixiv.net/users/example',
          skeb: 'https://skeb.jp/@example',
          instagram: 'https://instagram.com/example',
          website: 'https://example.com',
        },
      })
      setUser(mockUser)
    }

    fetchUserData()
  }, [userId])

  if (!user) return <div>Loading...</div>

  return (
    <div className="flex flex-col items-center w-full">
      <UserHeader user={user} />
      <div className="w-full px-6 pt-2 sm:pt-6">
        <UserDescription
          user={user}
          isFollowing={isFollowing}
          toggleFollow={toggleFollow}
        />
        <div className="flex flex-col items-start">
          <div className="mt-10 w-full max-w-2xl mx-auto">
            <h2 className="text-lg font-bold mb-4">投稿</h2>
            <TimelineStandard posts={userPosts} onToggleFollow={toggleFollow} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserPage
