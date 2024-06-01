import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import PostItem from '../components/PostItem/PostItem'
import { posts as mockPosts } from '../data/dummy-posts'
import { User } from '../models/user'
import PrimaryButton from '../components/common/PrimaryButton'
import toast from 'react-hot-toast'

const UserPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>()
  const [user, setUser] = useState<User | null>(null)
  const [isFollowing, setIsFollowing] = useState<boolean>(false)
  const userPosts = mockPosts.filter((post) => post.userId === userId)

  useEffect(() => {
    const fetchUserData = async () => {
      const mockUser = new User({
        npub: 'npub1v20e8yj9y7n58q5kfp0fahea9g4p3pmv2ufjgc6c9mcnugyeemyqu6s59g',
        pubkey:
          '629f93924527a7438296485e9edf3d2a2a18876c57132463582ef13e2099cec8',
        name: 'moti',
        image: 'https://randomuser.me/api/portraits/men/5.jpg',
      })
      setUser(mockUser)
    }

    fetchUserData()
  }, [userId])

  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
    toast(
      `@${userId}さん${isFollowing ? 'のフォローを解除しました' : 'をフォローしました'}`,
      {
        position: 'bottom-center',
        duration: 2000,
        style: {
          borderRadius: '40px',
          background: '#1d4ed8',
          color: '#fff',
        },
      }
    )
  }

  if (!user) return <div>Loading...</div>

  return (
    <div className="flex flex-col items-center p-4">
      <img
        src={user.image}
        alt="User profile"
        className="w-24 h-24 rounded-full mb-4"
      />
      <h1 className="text-xl font-bold">{user.name}</h1>
      <p className="text-gray-500">@{user.id}</p>
      <PrimaryButton className="mt-4" onClick={toggleFollow}>
        {isFollowing ? 'フォロー中' : 'フォローする'}
      </PrimaryButton>
      <div className="mt-8 w-full max-w-2xl">
        <h2 className="text-lg font-bold mb-4">投稿</h2>
        {userPosts.map((post) => (
          <PostItem key={post.id} post={post} onToggleFollow={() => false} />
        ))}
      </div>
    </div>
  )
}

export default UserPage
