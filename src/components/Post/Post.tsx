import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FiMoreHorizontal } from 'react-icons/fi';
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { convertTextForDisplay } from '../../utils/contentConverter';
import Overlay from '../Overlay/Overlay';
import PostMenu from './PostMenu';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import { PostType } from '../../global/types';
import toast, { Toaster } from 'react-hot-toast';
import RepliesThreadModal from '../Overlay/RepliesThreadModal';

type PostProps = PostType & {
  onToggleFollow: () => boolean;
};

export type PostActionType = "reply" | "repost" | "like" | "zap";

const Post: React.FC<PostProps> = ({ userName, userId, verified, content, likes, reposts, zaps, userImage, timestamp, mediaUrl, mediaType, following, onToggleFollow }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [isFollowing, setIsFollowing] = useState(following);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [isRepliesThreadModalOpen, setIsRepliesThreadModalOpen] = useState(false);
  const youtubeIFrameRef = useRef<HTMLIFrameElement>(null);

  const openMenu = () => setShowMenu(true);
  const closeMenu = () => setShowMenu(false);

  const openOverlay = () => setIsOverlayOpen(true);
  const closeOverlay = () => setIsOverlayOpen(false);
  const openRepliesThreadModal = () => setIsRepliesThreadModalOpen(true);
  const closeRepliesThreadModal = () => setIsRepliesThreadModalOpen(false);

  const isMobile = () => window.matchMedia('(max-width: 640px)').matches;

  const onClickAction = (type: PostActionType) => {
    if (type === "reply") {
      if (isMobile()) {
        openRepliesThreadModal();
      } else {
        openOverlay();
      }
    } else if (type === "repost") {
    } else if (type === "like") {
    } else if (type === "zap") {
    } else {
      throw new Error(`Unsupported type: ${type}`);
    }
  };

  const toggleShowMore = () => setShowMore(!showMore);
  const toggleFollow = () => {
    const success = onToggleFollow();
    if (success) {
      const newIsFollowing = !isFollowing;
      setIsFollowing(newIsFollowing);
      setShowMenu(false);
      toast(`@${userId}さん${newIsFollowing ? 'をフォローしました' : 'のフォローを解除しました'}`, {
        position: 'bottom-center',
        duration: 2000,
        style: {
          borderRadius: '40px',
          background: '#1d4ed8',
          color: '#fff',
        },
      });
    } else {
      toast.error('Failed to follow/unfollow user. Please try again.');
    }
  };

  const observer = useMemo(() => new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && youtubeIFrameRef.current) {
        const src = youtubeIFrameRef.current.getAttribute('src')?.split('?')[0];
        youtubeIFrameRef.current.setAttribute('src', `${src}?enablejsapi=1&autoplay=1&mute=1`);
      }
    },
    { threshold: 0.5 }
  ), []);

  useEffect(() => {
    const iframeRef = youtubeIFrameRef.current;
    if (iframeRef) observer.observe(iframeRef);

    return () => {
      if (iframeRef) observer.unobserve(iframeRef);
    };
  }, [observer]);

  return (
    <div className='relative'>
      <div className="flex justify-between items-center mb-2 font-noto-sans">
        <div className="flex items-center space-x-3">
          <img src={userImage} alt={`${userName}'s profile`} className="w-9 h-9 ml-1 rounded-full" />
          <div>
            <div className="flex items-center">
              <div className="font-semibold text-sm text-gray-700 dark:text-gray-300">{userName}</div>
              {verified && <RiVerifiedBadgeFill className="mt-1 ml-1 fill-blue-500" />}
              <div className="ml-2 text-xs text-gray-500 dark:text-gray-400">{timestamp}</div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">@{userId}</div>
          </div>
        </div>
        <FiMoreHorizontal
          className="text-xl cursor-pointer text-gray-700 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-500 transition"
          onClick={openMenu}
        />
      </div>
      {showMenu && <PostMenu userId={userId} isFollowing={isFollowing} onToggleFollow={toggleFollow} onClose={closeMenu} />}

      {mediaType && mediaUrl && <div className="mb-4">
        <PostMedia mediaType={mediaType} mediaUrl={mediaUrl} content={content} openOverlay={openOverlay} youtubeIFrameRef={youtubeIFrameRef} />
      </div>}

      <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 font-noto-sans">
        {showMore ? convertTextForDisplay(content) : convertTextForDisplay(content.substring(0, 100))}
        {content.length > 100 && (
          <span>
            {!showMore && <span>...</span>}
            <button onClick={toggleShowMore} className="text-blue-500 dark:text-blue-300 ml-2">
              {showMore ? '閉じる' : '続きを読む'}
            </button>
          </span>
        )}
      </div>
      <PostActions replies={0} reposts={reposts} likes={likes} zaps={zaps} onClickAction={onClickAction} />
      <Overlay isOpen={isOverlayOpen} onClose={closeOverlay} originalPost={{ userId, userName, verified, content, replies: 0, likes, reposts, zaps, userImage, timestamp, mediaUrl, mediaType, following: isFollowing }} onClickAction={onClickAction} />
      <RepliesThreadModal onClose={closeRepliesThreadModal} showModal={isRepliesThreadModalOpen} originalPost={{ userId, userName, verified, content, replies: 0, likes, reposts, zaps, userImage, timestamp, mediaUrl, mediaType, following: isFollowing }} />
      <Toaster />
    </div>
  );
};

export default Post;
