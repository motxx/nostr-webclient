import { AiOutlineThunderbolt } from 'react-icons/ai'
import { useNavigate } from 'react-router-dom'
import UserExternalLinks from './UserExternalLinks'
import { TextConverter } from '@/components/functional/TextConverter'
import { User } from '@/models/user'
import TertiaryButton from '@/components/ui-parts/TertiaryButton'
import FollowButton from '@/components/ui-parts/FollowButton'
import { nostrAddressForDisplay } from '@/utils/addressConverter'

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
    user.nostrAddress && user.nostrAddress === '_@motxx.pages.dev'
  const navigate = useNavigate()
  return (
    <>
      <div className="flex items-center justify-between pt-4 w-full">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <div className="flex items-center space-x-2 ml-auto">
          <UserExternalLinks links={user.links} />
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
              userId={user.nostrAddress || user.npub}
              isFollowing={isFollowing}
              toggleFollow={toggleFollow}
            />
          )}
        </div>
      </div>
      <div>
        <p className="text-gray-500">
          {user.nostrAddress
            ? nostrAddressForDisplay(user.nostrAddress)
            : user.npub}
        </p>
        <div className="flex space-x-4">
          <div>
            <span className="font-bold">{user.followingCount}</span> フォロー中
          </div>
          <div>
            <span className="font-bold">{user.followersCount}</span> フォロワー
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          <TextConverter text={user.bio} />
        </p>
      </div>
    </>
  )
}

export default UserDescription
