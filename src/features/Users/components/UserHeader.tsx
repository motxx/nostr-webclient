import { User } from '@/domain/entities/User'

interface UserHeaderProps {
  user: User
}

const UserHeader: React.FC<UserHeaderProps> = ({ user }) => {
  return (
    <div className="relative w-full">
      {user.profile?.banner ? (
        <img
          src={user.profile?.banner}
          alt="Header"
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-800"></div>
      )}
      <div className="absolute inset-0 flex items-center justify-center sm:justify-start sm:items-start sm:top-32 sm:left-8">
        <img
          src={user.profile?.image}
          alt="User profile"
          className="w-40 h-40 rounded-full border-4 border-white dark:border-black"
        />
      </div>
    </div>
  )
}

export default UserHeader
