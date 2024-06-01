import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import FollowButton from '../components/common/FollowButton'
import PostItem from '../components/PostItem/PostItem'
import { posts as mockPosts } from '../data/dummy-posts'
import { User } from '../models/user'
import { AiOutlineThunderbolt } from 'react-icons/ai'
import {
  FaGithub,
  FaMastodon,
  FaTelegram,
  FaInstagram,
  FaGlobe,
} from 'react-icons/fa'
import { SiBluesky, SiX } from 'react-icons/si'

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
        bio: 'This is a mock user bio.',
        followersCount: 150,
        followingCount: 100,
        headerImage: 'https://picsum.photos/600/200',
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
    return true
  }

  if (!user) return <div>Loading...</div>

  const renderLinkIcon = (
    url: string,
    IconComponent: React.ComponentType,
    alt: string
  ) => (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-2xl text-gray-700 dark:text-gray-300 hover:text-blue-500 transition"
    >
      <IconComponent aria-label={alt} />
    </a>
  )

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full">
        <img
          src={user.headerImage}
          alt="Header"
          className="w-full h-48 object-cover"
        />
        <div className="flex justify-center items-center">
          <img
            src={user.image}
            alt="User profile"
            className="absolute -bottom-20 sm:left-8 w-40 h-40 rounded-full border-4 border-white"
          />
        </div>
        <div className="absolute -bottom-12 right-4 flex space-x-2">
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={() => {}}
          >
            <AiOutlineThunderbolt className="text-3xl text-yellow-500" />
          </div>
          <FollowButton isFollowing={isFollowing} toggleFollow={toggleFollow} />
        </div>
      </div>
      <div className="mt-16 flex flex-col items-start w-full max-w-2xl px-4">
        <h1 className="text-xl font-bold">{user.name}</h1>
        <p className="text-gray-500">@{user.id}</p>
        <p className="mt-4">{user.bio}</p>
        <div className="flex space-x-4 mt-4">
          <div>
            <span className="font-bold">{user.followingCount}</span> フォロー中
          </div>
          <div>
            <span className="font-bold">{user.followersCount}</span> フォロワー
          </div>
        </div>
        <div className="flex space-x-4 mt-4">
          {user.links &&
            user.links.github &&
            renderLinkIcon(user.links.github, FaGithub, 'GitHub')}
          {user.links &&
            user.links.twitter &&
            renderLinkIcon(user.links.twitter, SiX, 'X')}
          {user.links &&
            user.links.bluesky &&
            renderLinkIcon(user.links.bluesky, SiBluesky, 'BlueSky')}
          {user.links &&
            user.links.mastodon &&
            renderLinkIcon(user.links.mastodon, FaMastodon, 'Mastodon')}
          {user.links &&
            user.links.telegram &&
            renderLinkIcon(user.links.telegram, FaTelegram, 'Telegram')}
          {user.links &&
            user.links.instagram &&
            renderLinkIcon(user.links.instagram, FaInstagram, 'Instagram')}
          {user.links &&
            user.links.website &&
            renderLinkIcon(user.links.website, FaGlobe, 'Website')}
        </div>
        <div className="mt-8 w-full">
          <h2 className="text-lg font-bold mb-4">投稿</h2>
          {userPosts.map((post) => (
            <PostItem key={post.id} post={post} onToggleFollow={() => false} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default UserPage
