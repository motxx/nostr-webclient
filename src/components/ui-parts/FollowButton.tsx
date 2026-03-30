import React from 'react'
import Button from '@/components/ui-elements/Button'
import classNames from 'classnames'
import { useFollow } from '@/hooks/useFollow'

interface FollowButtonProps {
  className?: string
  pubkey: string
  userId: string
}

const FollowButton: React.FC<FollowButtonProps> = ({
  className,
  pubkey,
  userId,
}) => {
  const { isFollowing, toggleFollow } = useFollow(pubkey)

  return (
    <Button
      onClick={() => toggleFollow(userId)}
      className={classNames(
        'px-4 py-2 font-semibold rounded-full whitespace-nowrap text-sm sm:text-base',
        {
          'border border-black dark:border-white bg-transparent hover:bg-gray-500 hover:bg-opacity-30':
            isFollowing,
          'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-600 hover:dark:bg-blue-700 active:dark:bg-blue-800 text-white':
            !isFollowing,
        },
        className
      )}
    >
      {isFollowing ? 'フォロー中' : 'フォロー'}
    </Button>
  )
}

export default FollowButton
