import React from 'react'
import { PiNotePencil } from 'react-icons/pi'
import NavigationBottomTabItem from './NavigationBottomTabItem'
import { NavigationItem, NavigationItemId } from './Navigation'

interface NavigationBottomTabProps {
  navigationItems: NavigationItem[]
  user: any
  shouldFocusBottomTab: boolean
  onNavigate: (to: NavigationItemId) => void
}

const NavigationBottomTab: React.FC<NavigationBottomTabProps> = ({
  navigationItems,
  user,
  shouldFocusBottomTab,
  onNavigate,
}) => {
  return (
    <>
      <div
        className={`absolute bottom-24 right-10 p-3 z-20 bg-blue-500 active:bg-blue-600 rounded-full drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] transition-opacity duration-200 ${shouldFocusBottomTab ? 'opacity-50' : 'opacity-100'}`}
        onClick={() => onNavigate('post')}
      >
        <PiNotePencil className="text-white text-center text-2xl" />
      </div>
      <div
        className={`z-20 bg-white dark:bg-black w-full h-20 fixed bottom-0 pb-8 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center px-4 transition-opacity duration-200 ${shouldFocusBottomTab ? 'opacity-50' : 'opacity-100'}`}
      >
        {navigationItems
          .filter((item) => item.id !== 'post')
          .map((item: NavigationItem, index: number) => (
            <NavigationBottomTabItem
              key={index}
              navigationItem={item}
              onNavigate={onNavigate}
            />
          ))}
        <div className="flex flex-col items-center cursor-pointer p-1 rounded-md transition active:bg-gray-200 dark:active:bg-gray-700">
          <img
            src={user.image}
            alt="User profile"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </div>
    </>
  )
}

export default NavigationBottomTab
