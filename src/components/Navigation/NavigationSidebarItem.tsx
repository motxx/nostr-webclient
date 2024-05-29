import React from 'react'
import { NavigationItem } from './Navigation'

interface NavigationSidebarItemProps extends NavigationItem {
  active: boolean
  onClick: () => void
}

const NavigationSidebarItem: React.FC<NavigationSidebarItemProps> = ({
  icon: Icon,
  label,
  active,
  onClick,
}) => {
  return (
    <div
      className="flex justify-center lg:justify-start items-center lg:space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 active:text-gray-400 dark:active:text-gray-400 rounded-md transition cursor-pointer"
      onClick={onClick}
    >
      <Icon
        className={`text-xl ${active ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
      />
      <span
        className={`hidden lg:block ${active ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}
      >
        {label}
      </span>
    </div>
  )
}

export default NavigationSidebarItem
