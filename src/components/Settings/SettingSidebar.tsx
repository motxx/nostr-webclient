import React from 'react'
import { PiCaretRightBold } from 'react-icons/pi'
import classNames from 'classnames'
import { SettingNavigationItem } from '../../pages/SettingsPage'
import { Link } from 'react-router-dom'

interface SettingSidebarProps {
  settingItems: SettingNavigationItem[]
  className?: string
}

const SettingSidebar: React.FC<SettingSidebarProps> = ({
  settingItems,
  className,
}) => {
  return (
    <div
      className={classNames(
        'w-full sm:w-1/3 sm:border-r sm:border-gray-200 sm:dark:border-gray-700 h-screen overflow-y-auto hide-scrollbar',
        className
      )}
    >
      <div className="">
        <h1 className="text-lg font-bold p-4">設定</h1>
        <nav>
          {settingItems.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              to={`${id}`}
              className="flex items-center px-4 py-3 hover:bg-gray-100
              dark:hover:bg-gray-900 transition duration-300 ease-in-out
              cursor-pointer"
            >
              <Icon className="text-xl mr-2" />
              <span className="text-gray-700 dark:text-gray-300">{label}</span>
              <PiCaretRightBold className="ml-auto text-gray-400 dark:text-gray-500" />
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default SettingSidebar
