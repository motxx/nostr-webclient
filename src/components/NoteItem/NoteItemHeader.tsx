import { FiMoreHorizontal } from 'react-icons/fi'
import { RiVerifiedBadgeFill } from 'react-icons/ri'
import NoteItemMenu from './NoteItemMenu'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NoteType } from '@/domain/entities/Note'
import { User } from '@/domain/entities/User'
import {
  nostrAddressSimplified,
  userIdForDisplay,
  userNameForDisplay,
} from '@/utils/addressConverter'
import { formatDateAsString } from '@/utils/timeConverter'
import UserAvatar from '@/components/ui-elements/UserAvatar'

interface NoteItemHeaderProps {
  note: NoteType
  onToggleFollow: (userId: string) => boolean
  onShowJSON: () => void
  className?: string
}

const NoteItemHeader: React.FC<NoteItemHeaderProps> = ({
  note,
  onToggleFollow,
  onShowJSON,
  className,
}) => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const openMenu = () => setShowMenu(true)
  const closeMenu = () => setShowMenu(false)

  const author = {
    image: note.author.profile?.image,
    name: userNameForDisplay(note.author),
    nostrAddress: note.author.profile?.nostrAddress,
    npub: note.author.npub,
    id: userIdForDisplay(note.author),
    verified: User.verified(note.author),
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-center font-noto-sans">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() =>
            navigate(
              `/user/${author.nostrAddress ? nostrAddressSimplified(author.nostrAddress) : author.npub}`
            )
          }
        >
          <UserAvatar src={author.image} name={author.name} size={32} />
          <div>
            <div className="flex items-center">
              <div className="font-semibold text-xs text-gray-700 dark:text-gray-300">
                {author.name}
              </div>
              {author.verified && (
                <RiVerifiedBadgeFill className="mt-1 ml-1 fill-blue-500" />
              )}
              <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {formatDateAsString(note.created_at)}
              </div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-pre-wrap break-words">
              {author.id}
            </div>
          </div>
        </div>
        <FiMoreHorizontal
          className="text-xl cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-500 transition"
          onClick={openMenu}
        />
      </div>
      {showMenu && (
        <NoteItemMenu
          userName={author.name}
          following={note.following ?? false /* TODO: author.following */}
          onToggleFollow={onToggleFollow}
          onClose={closeMenu}
          onShowJSON={onShowJSON}
        />
      )}
    </div>
  )
}

export default NoteItemHeader
