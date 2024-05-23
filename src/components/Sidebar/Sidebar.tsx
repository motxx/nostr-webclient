import React, { useState, useEffect } from 'react';
import { FiHome, FiSearch, FiBell, FiMessageSquare, FiPlusCircle } from 'react-icons/fi';
import { FaToggleOn, FaToggleOff } from 'react-icons/fa';
import userImage from '../../assets/images/example/me.png';
import MenuItem from './MenuItem';
import UserSection from './UserSection';
import BottomTab from './BottomTab';
import { IconType } from 'react-icons';

const user = {
  name: 'moti',
  id: '@very-very-long-user-id',
  image: userImage,
};

export type MenuItemType = {
  id: "home" | "search" | "notification" | "message" | "post";
  icon: IconType;
  label: string;
  onClick: () => void;
};

const menuItems: MenuItemType[] = [
  { id: "home", icon: FiHome, label: 'ホーム', onClick: () => {} },
  { id: "search", icon: FiSearch, label: '探索', onClick: () => {} },
  { id: "notification", icon: FiBell, label: '通知', onClick: () => {} },
  { id: "message", icon: FiMessageSquare, label: 'メッセージ', onClick: () => {} },
  { id: "post", icon: FiPlusCircle, label: 'ノートを書く', onClick: () => {} },
];

interface SidebarProps {
  shouldFocusBottomTab: boolean;
  focusBottomTab: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ shouldFocusBottomTab, focusBottomTab }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [isMining, setIsMining] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleMining = () => {
    setIsMining(!isMining);
  };

  const handleClickMenuItem = (id: MenuItemType["id"]) => {
    if (isMobile) {
      focusBottomTab();
    }
    console.log(`${id} clicked`);
  };

  return isMobile ? (
    <BottomTab menuItems={menuItems} user={user} shouldFocusBottomTab={shouldFocusBottomTab} onClickMenuItem={handleClickMenuItem} />
  ) : (
    <div className="bg-white dark:bg-black w-20 lg:w-60 h-full border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between px-4 py-6 fixed font-mplus-2">
      <div className="space-y-2 lg:space-y-4">
        <a className="flex justify-center lg:justify-start items-center lg:space-x-2 p-2 font-playlist-script" href='/'>
          <div className="text-2xl font-bold text-black hidden lg:block dark:text-white">Nostragram</div>
          <div className="text-2xl font-bold text-black lg:hidden dark:text-white">Ng</div>
        </a>
        {menuItems.map((item: any, index: number) => (
          <MenuItem key={index} icon={item.icon} id={item.id} label={item.label} onClick={() => item.onClick(() => setShowSearch(!showSearch))} />
        ))}
        <div
          className="flex justify-center lg:justify-start items-center lg:space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition cursor-pointer active:text-gray-400 dark:active:text-gray-400"
          onClick={handleToggleMining}
        >
          {isMining ? (
            <FaToggleOn className="text-xl text-green-500" />
          ) : (
            <FaToggleOff className="text-xl" />
          )}
          <span className="hidden lg:block">{isMining ? 'マイニング ON' : 'マイニング OFF'}</span>
        </div>
      </div>
      <UserSection user={user} />
    </div>
  );
};

export default Sidebar;
