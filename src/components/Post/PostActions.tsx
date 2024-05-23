import React from 'react';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { FiHeart, FiMessageCircle, FiRepeat } from 'react-icons/fi';

interface PostActionsProps {
  replies: number;
  reposts: number;
  likes: number;
  zaps: number;
  openPostDetails: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({ replies, reposts, likes, zaps, openPostDetails }) => {
  return (
    <div className="flex space-x-4 text-gray-500 dark:text-gray-400 font-noto-sans">
      <div className="flex items-center space-x-1 cursor-pointer group" onClick={openPostDetails}>
        <FiMessageCircle className="text-xl group-hover:text-blue-500 transition" />
        {replies > 0 && <span className="text-xs group-hover:text-blue-500 transition">{replies}</span>}
      </div>
      <div className="flex items-center space-x-1 cursor-pointer group">
        <FiRepeat className="text-xl group-hover:text-green-500 transition" />
        {reposts > 0 && <span className="text-xs group-hover:text-green-500 transition">{reposts}</span>}
      </div>
      <div className="flex items-center space-x-1 cursor-pointer group">
        <FiHeart className="text-xl group-hover:text-red-500 transition" />
        {likes > 0 && <span className="text-xs group-hover:text-red-500 transition">{likes}</span>}
      </div>
      <div className="flex items-center space-x-1 cursor-pointer group">
        <AiOutlineThunderbolt className="text-xl group-hover:text-yellow-500 transition" />
        {zaps > 0 && <span className="text-xs group-hover:text-yellow-500 transition">{zaps}</span>}
      </div>
    </div>
  );
};

export default PostActions;
