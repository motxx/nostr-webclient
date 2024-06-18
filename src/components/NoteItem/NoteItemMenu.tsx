import React, { useRef } from 'react'
import { FiUserPlus, FiUserX, FiVolumeX } from 'react-icons/fi'
import { useClickAway } from 'react-use'

interface NoteItemMenuProps {
  userName: string
  following: boolean
  onToggleFollow: (userId: string) => boolean
  onClose: () => void
}

const NoteItemMenu: React.FC<NoteItemMenuProps> = ({
  userName,
  following,
  onToggleFollow,
  onClose,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useClickAway(ref, onClose)

  const handleClickToggleFollow = () => {
    onToggleFollow(userName)
    onClose()
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm font-noto-sans font-bold"
    >
      <div
        className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-300"
        onClick={handleClickToggleFollow}
      >
        {following ? (
          <FiUserX className="w-5 h-5 mt-1 mr-2" />
        ) : (
          <FiUserPlus className="w-5 h-5 mt-1 mr-2" />
        )}
        {following
          ? `${userName}さんのフォローを解除`
          : `${userName}さんをフォロー`}
      </div>
      <div className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-300">
        <FiVolumeX className="w-5 h-5 mt-1 mr-2" />
        {userName}さんをミュート
      </div>
    </div>
  )
}

export default NoteItemMenu
