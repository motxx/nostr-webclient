import React from 'react';
import { FiHeart, FiMessageCircle, FiRepeat } from 'react-icons/fi';
import { AiOutlineThunderbolt } from 'react-icons/ai';

interface OverlayActionsProps {
  replies: number;
  likes: number;
  reposts: number;
  zaps: number;
  onBackgroundClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

const OverlayActions: React.FC<OverlayActionsProps> = ({ replies, likes, reposts, zaps, onBackgroundClick }) => {
  const handleActionClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  return (
    <div className="absolute bottom-0 pb-8 sm:pb-0 w-full bg-black bg-opacity-50" onClick={onBackgroundClick}>
      <div className="flex justify-around items-center text-white h-[62px]" onClick={onBackgroundClick}>
        <div className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20" onClick={handleActionClick}>
          <FiMessageCircle className="text-2xl group-hover:text-blue-500 transition" />
          {replies > 0 && <span className="text-sm group-hover:text-blue-500 transition">{replies}</span>}
        </div>
        <div className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20" onClick={handleActionClick}>
          <FiRepeat className="text-2xl group-hover:text-green-500 transition" />
          {reposts > 0 && <span className="text-sm group-hover:text-green-500 transition">{reposts}</span>}
        </div>
        <div className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20" onClick={handleActionClick}>
          <FiHeart className="text-2xl group-hover:text-red-500 transition" />
          {likes > 0 && <span className="text-sm group-hover:text-red-500 transition">{likes}</span>}
        </div>
        <div className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20" onClick={handleActionClick}>
          <AiOutlineThunderbolt className="text-2xl group-hover:text-yellow-500 transition" />
          {zaps > 0 && <span className="text-sm group-hover:text-yellow-500 transition">{zaps}</span>}
        </div>
      </div>
    </div>
  );
};

export default OverlayActions;
