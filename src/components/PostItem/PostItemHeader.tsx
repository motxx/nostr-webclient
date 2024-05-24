import { FiMoreHorizontal } from 'react-icons/fi'
import { RiVerifiedBadgeFill } from 'react-icons/ri'
import PostItemMenu from './PostItemMenu'
import { useState } from 'react'

interface PostItemHeaderProps {
  userName: string
  userId: string
  userImage: string
  verified: boolean
  timestamp: string
  isFollowing: boolean
  toggleFollow: () => void
}

const PostItemHeader: React.FC<PostItemHeaderProps> = ({
  userName,
  userId,
  userImage,
  verified,
  timestamp,
  isFollowing,
  toggleFollow,
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const openMenu = () => setShowMenu(true)
  const closeMenu = () => setShowMenu(false)

  const handleToggleFollow = () => {
    toggleFollow()
    closeMenu()
  }

  return (
    <>
      <div className="flex justify-between items-center font-noto-sans">
        <div className="flex items-center space-x-3">
          <img
            src={userImage}
            alt={`${userName}'s profile`}
            className="w-8 h-8 ml-1 rounded-full"
          />
          <div>
            <div className="flex items-center">
              <div className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                {userName}
              </div>
              {verified && (
                <RiVerifiedBadgeFill className="mt-1 ml-1 fill-blue-500" />
              )}
              <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {timestamp}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              @{userId}
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
          userId={userId}
          isFollowing={isFollowing}
          onToggleFollow={handleToggleFollow}
          onClose={closeMenu}
        />
      )}
    </>
  )
}

export default PostItemHeader
