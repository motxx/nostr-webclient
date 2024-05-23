import React from 'react';
import MediaContent from './MediaContent';
import OverlayActions from './OverlayActions';
import RepliesThread from './RepliesThread';
import { PostType } from '../../global/types';
import { PostActionType } from '../Post/Post';

interface OverlayProps {
  isOpen: boolean;
  onClose: () => void;
  originalPost: PostType;
  onClickAction: (type: PostActionType) => void;
}

const Overlay: React.FC<OverlayProps> = ({ isOpen, onClose, originalPost, onClickAction }) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75" onClick={handleBackgroundClick}>
      <div
        className="z-10 absolute top-2 left-2 w-10 h-10 flex items-center justify-center text-white text-xl rounded-full hover:bg-gray-500 cursor-pointer hover:bg-opacity-25"
        onClick={handleBackgroundClick}
      >
        ✕
      </div>
      <div className="relative w-full h-full flex overflow-hidden">
        <div className="relative flex-1 h-full" onClick={handleBackgroundClick}>
          {originalPost.mediaUrl && originalPost.mediaType && <MediaContent mediaUrl={originalPost.mediaUrl} mediaType={originalPost.mediaType} onBackgroundClick={handleBackgroundClick} />}
          <OverlayActions originalPost={originalPost} onBackgroundClick={handleBackgroundClick} onClickAction={onClickAction} />
        </div>
        <div className="hidden md:block w-80 h-full">
          <RepliesThread originalPost={originalPost} />
        </div>
      </div>
    </div>
  );
};

export default Overlay;
