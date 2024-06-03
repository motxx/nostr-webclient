import React from 'react'
import { FiUser, FiLogOut, FiEye } from 'react-icons/fi'
import { MdAccountBalanceWallet } from 'react-icons/md'
import { BiServer } from 'react-icons/bi'
import { PiCaretRightBold } from 'react-icons/pi'
import classNames from 'classnames'

interface SettingSidebarProps {
  selectedSetting: string | null
  handleSelectSetting: (setting: string) => void
  className?: string
}

const settings = [
  { name: 'プロフィール', icon: FiUser },
  { name: 'ウォレット', icon: MdAccountBalanceWallet },
  { name: 'リレー', icon: BiServer },
  { name: '表示', icon: FiEye },
  { name: 'ログアウト', icon: FiLogOut },
]

const SettingSidebar: React.FC<SettingSidebarProps> = ({
  handleSelectSetting,
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
        <ul>
          {settings.map(({ name, icon: Icon }) => (
            <li
              key={name}
              className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-900 transition duration-300 ease-in-out cursor-pointer"
              onClick={() => handleSelectSetting(name)}
            >
              <Icon className="text-xl mr-2" />
              <span className="text-gray-700 dark:text-gray-300">{name}</span>
              <PiCaretRightBold className="ml-auto text-gray-400 dark:text-gray-500" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default SettingSidebar
