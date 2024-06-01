import React from 'react'
import { FiUser, FiLogOut } from 'react-icons/fi'
import { MdAccountBalanceWallet } from 'react-icons/md'
import { BiServer } from 'react-icons/bi'

const SettingsPage: React.FC = () => {
  return (
    <div className="flex h-full">
      <div className="w-full sm:w-1/3 sm:border-r sm:border-gray-200 sm:dark:border-gray-700 h-screen overflow-y-auto hide-scrollbar">
        <div className="p-4">
          <h1 className="text-lg font-bold mb-4">設定</h1>
          <ul className="space-y-2">
            <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition duration-300 ease-in-out cursor-pointer">
              <FiUser className="text-xl mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                プロフィール
              </span>
            </li>
            <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition duration-300 ease-in-out cursor-pointer">
              <MdAccountBalanceWallet className="text-xl mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                ウォレット
              </span>
            </li>
            <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition duration-300 ease-in-out cursor-pointer">
              <BiServer className="text-xl mr-2" />
              <span className="text-gray-700 dark:text-gray-300">リレー</span>
            </li>
            <li className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-900 transition duration-300 ease-in-out cursor-pointer">
              <FiLogOut className="text-xl mr-2" />
              <span className="text-gray-700 dark:text-gray-300">
                ログアウト
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
