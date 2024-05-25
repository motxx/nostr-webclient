import React from 'react'
import { NavigationItem } from './Navigation'

interface NavigationSidebarItemProps extends NavigationItem {
  onClick: () => void
}

const NavigationSidebarItem: React.FC<NavigationSidebarItemProps> = ({
  icon: Icon,
  label,
  onClick,
}) => {
  return (
    <div
      className="flex justify-center lg:justify-start items-center lg:space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 active:text-gray-400 dark:active:text-gray-400 rounded-md transition cursor-pointer"
      onClick={onClick}
    >
      <Icon className="text-xl" />
      <span className="hidden lg:block">{label}</span>
    </div>
  )
}

export default NavigationSidebarItem
