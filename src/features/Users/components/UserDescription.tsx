import { AiOutlineThunderbolt } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import UserExternalLinks from './UserExternalLinks'
import { TextConverter } from '@/components/functional/TextConverter'
import TertiaryButton from '@/components/ui-parts/TertiaryButton'
import FollowButton from '@/components/ui-parts/FollowButton'
import { nostrAddressForDisplay } from '@/utils/addressConverter'
import { User } from '@/domain/entities/User'

interface UserDescriptionProps {
  user: User
  isFollowing: boolean
  toggleFollow: (userId: string) => boolean
}

const UserDescription: React.FC<UserDescriptionProps> = ({
  user,
  isFollowing,
  toggleFollow,
}) => {
  const isUserMe =
    user.profile?.nostrAddress &&
    user.profile?.nostrAddress === '_@motxx.pages.dev'
  const navigate = useNavigate()
  return (
    <>
      <div className="flex items-center justify-between pt-4 w-full">
        <h1 className="text-2xl font-bold">
          {user.profile?.name || user.npub}
        </h1>
        <div className="flex items-center space-x-2 ml-auto">
          {user.profile?.links && (
            <UserExternalLinks links={user.profile.links} />
          )}
          <AiOutlineThunderbolt className="text-3xl text-yellow-500" />
          {isUserMe ? (
            <TertiaryButton
              onClick={() => navigate('/settings/account')}
              className="px-4 py-2 text-sm"
            >
              プロフィールを編集
            </TertiaryButton>
          ) : (
            <FollowButton
              userId={user.profile?.nostrAddress || user.npub}
              isFollowing={isFollowing}
              toggleFollow={toggleFollow}
            />
          )}
        </div>
      </div>
      <div>
        <p className="text-gray-500">
          {user.profile?.nostrAddress
            ? nostrAddressForDisplay(user.profile?.nostrAddress)
            : user.npub}
        </p>
        <div className="flex space-x-4">
          <div>
            <span className="font-bold">
              {user.profile?.followingCount || '?'}
            </span>{' '}
            フォロー中
          </div>
          <div>
            <span className="font-bold">
              {user.profile?.followersCount || '?'}
            </span>{' '}
            フォロワー
          </div>
        </div>
        {user.profile?.bio && (
          <p className="mt-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
            <TextConverter text={user.profile.bio} />
          </p>
        )}
      </div>
    </>
  )
}

export default UserDescription
