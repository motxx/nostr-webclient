import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import UserHeader from './components/UserHeader'
import UserDescription from './components/UserDescription'
import UserContents from './components/UserContents'
import { User } from '@/domain/entities/User'
import { UserProfile } from '@/domain/entities/UserProfile'

interface UserPageProps {
  isFollowing: boolean
  toggleFollow: (userId: string) => boolean
}

const UserPage: React.FC<UserPageProps> = ({ isFollowing, toggleFollow }) => {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const mockUser = new User({
        npub: 'npub1v20e8yj9y7n58q5kfp0fahea9g4p3pmv2ufjgc6c9mcnugyeemyqu6s59g',
        pubkey:
          '629f93924527a7438296485e9edf3d2a2a18876c57132463582ef13e2099cec8',
        profile: new UserProfile({
          name: 'moti',
          nostrAddress: '_@motxx.pages.dev',
          image: 'https://randomuser.me/api/portraits/men/5.jpg',
          bio: 'This is a mock user bio.\nnostr:npub14wr8qwpe82k072mjhdg8qjv0hkrkuvguwcjr7hmw5vn3336tg3dqgm752r\nhttps://www.example.com',
          followersCount: 150,
          followingCount: 100,
          banner:
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
        }),
      })
      setUser(mockUser)
    }

    fetchUserData()
  }, [userId])

  if (!user) return <div>Loading...</div>

  return (
    <div className="flex flex-col items-center w-full">
      <UserHeader user={user} />
      <div className="w-full">
        <div className="px-2 sm:px-6 pt-2 sm:pt-6">
          <UserDescription
            user={user}
            isFollowing={isFollowing}
            toggleFollow={toggleFollow}
          />
        </div>
        <div className="flex flex-col items-start pt-10">
          <UserContents user={user} toggleFollow={toggleFollow} />
        </div>
      </div>
    </div>
  )
}

export default UserPage
