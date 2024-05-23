import React, { useState, useRef } from 'react';
import Post from '../Post/Post';
import { posts } from '../../data/dummy-posts';

interface TimelineProps {
  onScrollUp: () => void;
  onScrollDown: () => void;
}

const Timeline: React.FC<TimelineProps> = ({ onScrollUp, onScrollDown }) => {
  const [activeTab, setActiveTab] = useState('フォロー中');
  const timelineRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef<HTMLDivElement>(null);
  const [lastScrollTop, setLastScrollTop] = useState(0);

  const tabs = ['フォロー中', 'おすすめ', 'イラスト', 'コミック', 'クリップ'];

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (timelineRef.current) {
      timelineRef.current.scrollTop = 0;
    }
  };

  const handleScroll = () => {
    const scrollElement = timelineRef.current;
    if (scrollElement) {
      const currentScrollTop = scrollElement.scrollTop;
      if (tabRef.current && currentScrollTop <= tabRef.current.clientHeight) {
        onScrollUp();
      } else if (currentScrollTop > lastScrollTop) {
        onScrollDown();
      } else if (currentScrollTop < lastScrollTop) {
        onScrollUp();
      }
      setLastScrollTop(currentScrollTop);
    }
  };

  return (
    <div ref={timelineRef} onScroll={handleScroll} className="w-full max-w-2xl mx-auto overflow-auto" style={{ maxHeight: '100vh' }}>
      <div ref={tabRef} className="sticky top-0 bg-white dark:bg-black z-10 overflow-x-auto hide-scrollbar">
        <div className="flex min-w-[500px] border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab}
              className={`flex-1 text-center py-3 border-b-2 ${activeTab === tab ? 'border-blue-500 font-semibold text-gray-700 dark:text-gray-300' : 'border-white dark:border-black text-gray-500 dark:text-gray-500'} hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-mplus-2`}
              onClick={() => handleTabClick(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-center w-full">
        <div className="pl-6 pr-6 pt-8 mb-20 max-w-xl">
          {posts.map((post) => (
            <div key={post.id} className='mb-12 sm:mb-14'>
              <Post
                userId={post.userId}
                userName={post.userName}
                verified={post.verified}
                content={post.content}
                likes={post.likes}
                zaps={post.zaps}
                reposts={post.reposts}
                userImage={post.userImage}
                timestamp={post.timestamp}
                mediaUrl={post.mediaUrl}
                mediaType={post.mediaType}
                following={post.following}
                onToggleFollow={() => {
                  post.following = !post.following;
                  console.log(`Follow toggle: ${post.userId} ${post.following}`);
                  return true;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Timeline;
