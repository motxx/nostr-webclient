import React, { useState } from 'react';
import { FiHeart, FiMessageCircle, FiRepeat } from 'react-icons/fi';
import { AiOutlineThunderbolt } from 'react-icons/ai';
import { PostActionType } from '../Post/Post';
import ReplyModal from './ReplyModal';
import { PostType } from '../../global/types';
import RepliesThreadModal from './RepliesThreadModal';

interface OverlayActionsProps {
  onBackgroundClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onClickAction: (type: PostActionType) => void;
  originalPost: PostType;
}

const OverlayActions: React.FC<OverlayActionsProps> = ({ onBackgroundClick, onClickAction, originalPost }) => {
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [isRepliesThreadModalOpen, setIsRepliesThreadModalOpen] = useState(false);

  const handleActionClick = (e: React.MouseEvent<HTMLDivElement>, type: PostActionType) => {
    e.stopPropagation();
    if (type === "reply") {
      if (window.matchMedia('(max-width: 640px)').matches) {
        setIsRepliesThreadModalOpen(true);
      } else {
        setIsReplyModalOpen(true);
      }
    } else {
      onClickAction(type);
    }
  };

  const handleReplySubmit = (replyContent: string) => {
    console.log('New reply content:', replyContent);
    // ここで返信の処理を実装します。
  };

  return (
    <div className="absolute bottom-0 pb-8 sm:pb-0 w-full bg-black bg-opacity-50" onClick={onBackgroundClick}>
      <div className="flex justify-around items-center text-white h-[62px]" onClick={onBackgroundClick}>
        <div className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20" onClick={(e) => handleActionClick(e, "reply")}>
          <FiMessageCircle className="text-2xl group-hover:text-blue-500 transition" />
          {originalPost.replies > 0 && <span className="text-sm group-hover:text-blue-500 transition">{originalPost.replies}</span>}
        </div>
        <div className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20" onClick={(e) => handleActionClick(e, "repost")}>
          <FiRepeat className="text-2xl group-hover:text-green-500 transition" />
          {originalPost.reposts > 0 && <span className="text-sm group-hover:text-green-500 transition">{originalPost.reposts}</span>}
        </div>
        <div className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20" onClick={(e) => handleActionClick(e, "like")}>
          <FiHeart className="text-2xl group-hover:text-red-500 transition" />
          {originalPost.likes > 0 && <span className="text-sm group-hover:text-red-500 transition">{originalPost.likes}</span>}
        </div>
        <div className="flex items-center space-x-1 cursor-pointer group h-full min-w-10 sm:min-w-20" onClick={(e) => handleActionClick(e, "zap")}>
          <AiOutlineThunderbolt className="text-2xl group-hover:text-yellow-500 transition" />
          {originalPost.zaps > 0 && <span className="text-sm group-hover:text-yellow-500 transition">{originalPost.zaps}</span>}
        </div>
      </div>
      <ReplyModal isOpen={isReplyModalOpen} onClose={() => setIsReplyModalOpen(false)} originalPost={originalPost} onSubmit={handleReplySubmit} />
      <RepliesThreadModal onClose={() => setIsRepliesThreadModalOpen(false)} showModal={isRepliesThreadModalOpen} originalPost={originalPost} />
    </div>
  );
};

export default OverlayActions;
