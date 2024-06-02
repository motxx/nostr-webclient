import { AiOutlineThunderbolt } from 'react-icons/ai'
import { TextConverter } from '../common/TextConverter'
import UserExternalLinks from './UserExternalLinks'
import FollowButton from '../common/FollowButton'
import { nostrAddressForDisplay } from '../../utils/addressConverter'
import { User } from '../../models/user'

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
  return (
    <>
      <div className="flex items-center justify-between pt-4 w-full">
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <div className="flex items-center space-x-2 ml-auto">
          <UserExternalLinks links={user.links} />
          <AiOutlineThunderbolt className="text-3xl text-yellow-500" />
          <FollowButton
            userId={user.nostrAddress || user.npub}
            isFollowing={isFollowing}
            toggleFollow={toggleFollow}
          />
        </div>
      </div>
      <div>
        <p className="text-gray-500">
          {user.nostrAddress
            ? nostrAddressForDisplay(user.nostrAddress)
            : user.npub}
        </p>
        <p className="mt-4 text-sm text-gray-700 dark:text-gray-300">
          <TextConverter text={user.bio} />
        </p>
        <div className="flex space-x-4">
          <div>
            <span className="font-bold">{user.followingCount}</span> フォロー中
          </div>
          <div>
            <span className="font-bold">{user.followersCount}</span> フォロワー
          </div>
        </div>
      </div>
    </>
  )
}

export default UserDescription
