import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { userIdForDisplay } from '@/utils/addressConverter'
import { AppContext } from '@/context/AppContext'

const NavigationSidebarUserSection: React.FC = () => {
  const {
    auth: { loggedInUser },
  } = useContext(AppContext)
  const navigate = useNavigate()

  return (
    loggedInUser && (
      <div
        className="flex justify-center lg:justify-start items-center lg:space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-7000 text-gray-700 dark:text-gray-300 rounded-md transition cursor-pointer"
        onClick={() =>
          navigate(
            `/user/${loggedInUser.profile?.nostrAddress ?? loggedInUser.npub}`
          )
        }
      >
        <img
          src={loggedInUser.profile?.image}
          alt="User profile"
          className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
        />
        <div className="hidden lg:block ml-2">
          <div>{loggedInUser.profile?.name}</div>
          <div className="text-gray-500 dark:text-gray-400">
            {userIdForDisplay(loggedInUser)}
          </div>
        </div>
      </div>
    )
  )
}

export default NavigationSidebarUserSection
