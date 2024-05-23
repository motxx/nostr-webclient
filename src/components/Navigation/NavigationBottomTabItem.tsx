import React from 'react'
import { NavigationItem, NavigationItemId } from './Navigation'

interface NavigationBottomTabItemProps {
  navigationItem: NavigationItem
  onNavigate: (to: NavigationItemId) => void
}

const NavigationBottomTabItem: React.FC<NavigationBottomTabItemProps> = ({
  navigationItem,
  onNavigate,
}) => {
  return (
    <div
      className="flex flex-col items-center cursor-pointer p-2 rounded-md transition active:bg-gray-200 dark:active:bg-gray-700"
      onClick={() => onNavigate(navigationItem.id)}
    >
      <navigationItem.icon className="text-2xl text-gray-700 dark:text-gray-300" />
    </div>
  )
}

export default NavigationBottomTabItem
