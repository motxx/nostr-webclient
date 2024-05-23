import React from 'react'

const NavigationSidebarUserSection = ({ user }: any) => {
  return (
    <div className="flex justify-center lg:justify-start items-center lg:space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800 rounded-md transition cursor-pointer">
      <img
        src={user.image}
        alt="User profile"
        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full"
      />
      <div className="hidden lg:block ml-2">
        <div>{user.name}</div>
        <div className="text-gray-500 dark:text-gray-400">
          {user.id.substring(0, 17)}
        </div>
      </div>
    </div>
  )
}

export default NavigationSidebarUserSection
