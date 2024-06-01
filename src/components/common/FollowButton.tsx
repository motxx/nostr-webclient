interface FollowButtonProps {
  className?: string
  isFollowing: boolean
  toggleFollow: () => boolean
}

const FollowButton: React.FC<FollowButtonProps> = ({
  className,
  isFollowing,
  toggleFollow,
}) => (
  <button
    className={`px-4 py-2 font-semibold rounded-full ${isFollowing ? 'border border-black dark:border-white bg-transparent hover:bg-gray-500 hover:bg-opacity-30' : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-600 hover:dark:bg-blue-700 active:dark:bg-blue-800 text-white'}`}
    onClick={toggleFollow}
  >
    {isFollowing ? 'フォロー中' : 'フォロー'}
  </button>
)

export default FollowButton
