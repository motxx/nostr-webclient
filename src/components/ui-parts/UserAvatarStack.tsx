import React from 'react'
import UserAvatar from '@/components/ui-elements/UserAvatar'

interface UserAvatarStackProps {
  users: Array<{ image?: string; name: string }>
  size?: number
  borderColor?: string
}

const UserAvatarStack: React.FC<UserAvatarStackProps> = ({
  users,
  size = 8,
  borderColor = 'border-white dark:border-gray-800',
}) => (
  <div className="flex -space-x-2">
    {users.map((user, idx) => (
      <div
        key={idx}
        className={`w-${size + 1} h-${size + 1} rounded-full border-2 ${borderColor}`}
        style={{ zIndex: users.length - idx }}
      >
        <UserAvatar src={user.image} name={user.name} size={size * 4} />
      </div>
    ))}
  </div>
)

export default UserAvatarStack
