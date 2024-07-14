import React from 'react'
import Avatar from 'boring-avatars'

interface UserAvatarProps {
  src?: string
  name: string
  size: number
}

const UserAvatar: React.FC<UserAvatarProps> = ({ src, name, size }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={`${name}'s avatar`}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <Avatar
      size={size}
      name={name}
      variant="beam"
      colors={['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90']}
    />
  )
}

export default UserAvatar
