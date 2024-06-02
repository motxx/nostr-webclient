import { User } from '../../models/user'

interface UserHeaderProps {
  user: User
}

const UserHeader: React.FC<UserHeaderProps> = ({ user }) => {
  return (
    <div className="relative w-full">
      <img
        src={user.headerImage}
        alt="Header"
        className="w-full h-64 object-cover"
      />
      <div className="absolute inset-0 flex items-center justify-center sm:justify-start sm:items-start sm:top-32 sm:left-8">
        <img
          src={user.image}
          alt="User profile"
          className="w-40 h-40 rounded-full border-4 border-white dark:border-black"
        />
      </div>
    </div>
  )
}

export default UserHeader
