import React from 'react'
import { useNavigate } from 'react-router-dom'
import { User } from '../../models/user'
import { userIdForDisplay } from '../../utils/addressConverter'

interface NavigationSidebarUserSectionProps {
  user: User
}

const NavigationSidebarUserSection: React.FC<
  NavigationSidebarUserSectionProps
> = ({ user }) => {
  const navigate = useNavigate()
  return (
    <div
      className="flex justify-center lg:justify-start items-center lg:space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md transition cursor-pointer"
      onClick={() => navigate(`/user/${user.nostrAddress || user.npub}`)}
    >
      <img
        src={user.image}
        alt="User profile"
        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
      />
      <div className="hidden lg:block ml-2">
        <div>{user.name}</div>
        <div className="text-gray-500 dark:text-gray-400">
          {userIdForDisplay(user.nostrAddress ?? user.npub)}
        </div>
      </div>
    </div>
  )
}

export default NavigationSidebarUserSection
