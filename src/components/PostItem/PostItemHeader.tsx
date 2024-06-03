import { FiMoreHorizontal } from 'react-icons/fi'
import { RiVerifiedBadgeFill } from 'react-icons/ri'
import PostItemMenu from './PostItemMenu'
import { useState } from 'react'
import { PostItemType } from '@/global/types'
import { useNavigate } from 'react-router-dom'

interface PostItemHeaderProps {
  post: PostItemType
  onToggleFollow: (userId: string) => boolean
}

const PostItemHeader: React.FC<PostItemHeaderProps> = ({
  post,
  onToggleFollow,
}) => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const openMenu = () => setShowMenu(true)
  const closeMenu = () => setShowMenu(false)

  return (
    <>
      <div className="flex justify-between items-center font-noto-sans">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(`/user/${post.userId}`)}
        >
          <img
            src={post.userImage}
            alt={`${post.userName}'s profile`}
            className="w-8 h-8 ml-1 rounded-full"
          />
          <div>
            <div className="flex items-center">
              <div className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                {post.userName}
              </div>
              {post.verified && (
                <RiVerifiedBadgeFill className="mt-1 ml-1 fill-blue-500" />
              )}
              <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {post.timestamp}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              @{post.userId}
            </div>
          </div>
        </div>
        <FiMoreHorizontal
          className="text-xl cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-500 transition"
          onClick={openMenu}
        />
      </div>
      {showMenu && (
        <PostItemMenu
          userId={post.userId}
          following={post.following}
          onToggleFollow={onToggleFollow}
          onClose={closeMenu}
        />
      )}
    </>
  )
}

export default PostItemHeader
