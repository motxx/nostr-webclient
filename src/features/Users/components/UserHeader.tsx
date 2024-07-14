import React from 'react'
import { User } from '@/domain/entities/User'
import UserAvatar from '@/components/ui-elements/UserAvatar'

interface UserHeaderProps {
  user: User
}

const UserHeader: React.FC<UserHeaderProps> = ({ user }) => {
  const fullName = user.profile?.name || user.npub
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
        <div className="w-40 h-40 rounded-full border-4 border-white dark:border-black overflow-hidden">
          <UserAvatar src={user.profile?.image} name={fullName} size={160} />
        </div>
      </div>
    </div>
  )
}

export default UserHeader
