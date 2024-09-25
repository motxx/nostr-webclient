import React from 'react'
import { PiNotePencil } from 'react-icons/pi'
import NavigationBottomTabItem from './NavigationBottomTabItem'
import { NavigationItem, NavigationItemId } from './Navigation'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface NavigationBottomTabProps {
  navigationItems: NavigationItem[]
  shouldFocusBottomTab: boolean
  shouldShowPostButton: boolean
  onNavigate: (to: NavigationItemId) => void
  onPostNote: () => void
}

const NavigationBottomTab: React.FC<NavigationBottomTabProps> = ({
  navigationItems,
  shouldFocusBottomTab,
  shouldShowPostButton,
  onNavigate,
  onPostNote,
}) => {
  const navigate = useNavigate()
  const { loggedInUser } = useAuth()
  return (
    <>
      {shouldShowPostButton && (
        <div
          className={`absolute bottom-24 right-6 p-3 z-20 bg-blue-500 active:bg-blue-600 dark:bg-blue-600 active:dark:bg-blue-700 rounded-full drop-shadow-[0_2px_2px_rgba(0,0,0,0.25)] transition-opacity duration-200 ${shouldFocusBottomTab ? 'opacity-50' : 'opacity-100'}`}
          onClick={() => onPostNote()}
        >
          <PiNotePencil className="text-white text-center text-2xl" />
        </div>
      )}
      <div
        className={`z-50 bg-white dark:bg-black w-full h-20 fixed bottom-0 pb-8 border-t border-gray-200 dark:border-gray-700 flex justify-around items-center px-4 transition-opacity duration-200 ${shouldFocusBottomTab ? 'opacity-50' : 'opacity-100'}`}
      >
        {navigationItems
          .filter((item) => !item.hiddenOnMobile)
          .map((item: NavigationItem, index: number) => (
            <NavigationBottomTabItem
              key={index}
              navigationItem={item}
              onNavigate={onNavigate}
            />
          ))}
        {loggedInUser && (
          <div
            className="flex flex-col items-center cursor-pointer p-1 rounded-md transition active:bg-gray-200 dark:active:bg-gray-7000"
            onClick={() =>
              navigate(
                `/user/${loggedInUser.profile?.nostrAddress || loggedInUser.npub}`
              )
            }
          >
            <img
              src={loggedInUser.profile?.image}
              alt="User profile"
              className="w-8 h-8 rounded-full"
            />
          </div>
        )}
      </div>
    </>
  )
}

export default NavigationBottomTab
