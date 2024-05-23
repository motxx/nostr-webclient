import React, { useRef } from 'react';
import { FiUserPlus, FiUserX, FiVolumeX } from 'react-icons/fi';
import { useClickAway } from 'react-use';

interface PostMenuProps {
  userId: string;
  isFollowing: boolean;
  onToggleFollow: () => void;
  onClose: () => void;
}

const PostMenu: React.FC<PostMenuProps> = ({ userId, isFollowing, onToggleFollow, onClose }) => {
  const ref = useRef<HTMLDivElement>(null);

  useClickAway(ref, onClose);

  return (
    <div ref={ref} className="absolute right-0 top-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-sm font-noto-sans font-bold">
      <div
        className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-300"
        onClick={onToggleFollow}
      >
        {isFollowing ? <FiUserX className="w-5 h-5 mt-1 mr-2" /> : <FiUserPlus className="w-5 h-5 mt-1 mr-2" />}
        {isFollowing ? `@${userId}さんのフォローを解除` : `@${userId}さんをフォロー`}
      </div>
      <div className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-800 dark:text-gray-300">
        <FiVolumeX className="w-5 h-5 mt-1 mr-2" />
        @{userId}さんをミュート
      </div>
    </div>
  );
};

export default PostMenu;
