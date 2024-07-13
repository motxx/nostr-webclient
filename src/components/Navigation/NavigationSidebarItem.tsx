import React from 'react'
import { IconType } from 'react-icons'
import { NavigationItemId } from './Navigation'

interface NavigationSidebarItemProps {
  icon: IconType
  id: NavigationItemId
  label: string
  active: boolean
  onClick: () => void
  isPostNote?: boolean
}

const NavigationSidebarItem: React.FC<NavigationSidebarItemProps> = ({
  icon: Icon,
  id,
  label,
  active,
  onClick,
  isPostNote = false,
}) => {
  const baseClasses =
    'flex justify-center items-center lg:space-x-2 p-2 transition cursor-pointer'
  const activeClasses =
    'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md lg:justify-start'
  const inactiveClasses =
    'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md lg:justify-start'
  const postNoteClasses =
    'bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white sm:p-3 lg:p-2 rounded-full'

  const classes = `${baseClasses} ${
    isPostNote ? postNoteClasses : active ? activeClasses : inactiveClasses
  }`

  return (
    <div className={classes} onClick={onClick}>
      <Icon className={`text-xl ${isPostNote ? 'text-white' : ''}`} />
      <span className="hidden lg:block">{label}</span>
    </div>
  )
}

export default NavigationSidebarItem
