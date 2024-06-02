import React, { useState } from 'react'
import { FaToggleOn, FaToggleOff } from 'react-icons/fa'
import NavigationSidebarItem from './NavigationSidebarItem'
import NavigationSidebarUserSection from './NavigationSidebarUserSection'
import { NavigationItem, NavigationItemId } from './Navigation'
import { Link } from 'react-router-dom'
import { User } from '../../models/user'

interface NavigationSidebarProps {
  navigationItems: NavigationItem[]
  activeItemId: NavigationItemId
  user: User
  onNavigate: (to: NavigationItemId) => void
}

const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  navigationItems,
  activeItemId,
  user,
  onNavigate,
}) => {
  const [isMining, setIsMining] = useState(false)

  const handleToggleMining = () => {
    setIsMining(!isMining)
  }

  const isActiveItem = (id: NavigationItemId) => id === activeItemId

  return (
    <div className="bg-white dark:bg-black w-20 lg:w-60 h-full border-r border-gray-200 dark:border-gray-700 flex flex-col justify-between px-4 py-6 fixed font-mplus-2">
      <div className="space-y-2 lg:space-y-4">
        <Link
          className="hidden lg:block lg:justify-start items-center lg:space-x-2 p-2 font-['Futura']"
          to="/"
        >
          <div className="text-2xl font-bold text-black hidden lg:block dark:text-white">
            Noscape
          </div>
        </Link>
        {navigationItems.map((item: NavigationItem, index: number) => (
          <NavigationSidebarItem
            key={index}
            icon={item.icon}
            id={item.id}
            label={item.label}
            active={isActiveItem(item.id)}
            onClick={() => onNavigate(item.id)}
          />
        ))}
        <div
          className="flex justify-center lg:justify-start items-center lg:space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition cursor-pointer active:text-gray-400 dark:active:text-gray-400"
          onClick={handleToggleMining}
        >
          {isMining ? (
            <FaToggleOn className="text-xl text-green-500" />
          ) : (
            <FaToggleOff className="text-xl text-gray-400 dark:text-gray-500" />
          )}
          <span
            className={`hidden lg:block ${isMining ? 'text-gray-600 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}`}
          >
            {isMining ? 'マイニング ON' : 'マイニング OFF'}
          </span>
        </div>
      </div>
      <NavigationSidebarUserSection user={user} />
    </div>
  )
}

export default NavigationSidebar
