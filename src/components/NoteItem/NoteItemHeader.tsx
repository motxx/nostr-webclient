import { FiMoreHorizontal } from 'react-icons/fi'
import { RiVerifiedBadgeFill } from 'react-icons/ri'
import NoteItemMenu from './NoteItemMenu'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { NoteType } from '@/domain/entities/Note'
import { User } from '@/domain/entities/User'
import { userIdForDisplay, userNameForDisplay } from '@/utils/addressConverter'
import { formatDateAsString } from '@/utils/timeConverter'
import Avatar from 'boring-avatars'

interface NoteItemHeaderProps {
  note: NoteType
  onToggleFollow: (userId: string) => boolean
}

const NoteItemHeader: React.FC<NoteItemHeaderProps> = ({
  note,
  onToggleFollow,
}) => {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const openMenu = () => setShowMenu(true)
  const closeMenu = () => setShowMenu(false)

  const author = {
    image: note.author.profile?.image,
    name: userNameForDisplay(note.author),
    id: userIdForDisplay(note.author),
    verified: User.verified(note.author),
  }

  /*
  // 遅延読み込みに対応する場合に使う
  const observer = useMemo(
    () =>
      new IntersectionObserver(async ([entry]) => {
        if (
          entry.isIntersecting &&
          noteItemHeaderRef.current &&
          nostrClient &&
          !note.author.profile?.name
        ) {
          console.log('fetching profile:', note.author.npub)
          const userProfileService = new UserProfileService(nostrClient)
          const profile = await new FetchUserProfile(
            userProfileService
          ).execute(note.author.npub)
          if (profile) {
            note.author.profile = profile
          }
        }
      }),
    [note.author, nostrClient]
  )

  useEffect(() => {
    const headerRef = noteItemHeaderRef.current
    if (headerRef) observer.observe(headerRef)

    return () => {
      if (headerRef) observer.unobserve(headerRef)
    }
  }, [observer])
  */

  return (
    <div>
      <div className="flex justify-between items-center font-noto-sans">
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(`/user/${note.author.npub}`)}
        >
          {author.image ? (
            <img
              src={author.image}
              alt={`${author.name}'s profile`}
              className="w-8 h-8 ml-1 rounded-full"
            />
          ) : (
            <Avatar
              size={32}
              name={note.author.profile?.name || note.author.npub}
              variant="beam"
              colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
            />
          )}
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
            <div className="text-xs text-gray-500 dark:text-gray-400">
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
        />
      )}
    </div>
  )
}

export default NoteItemHeader
