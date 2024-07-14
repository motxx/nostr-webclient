import React from 'react'
import NotificationList from './components/NotificationList'
import { useNotifications } from './hooks/useNotifications'
import Spinner from '@/components/ui-elements/Spinner'

const NotificationPage: React.FC = () => {
  const { notifications, isLoading } = useNotifications()

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <h2 className="text-xl font-bold ml-2 mb-4 text-gray-700 dark:text-gray-300">
        通知
      </h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner className="w-8 h-8 text-blue-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            読み込み中...
          </span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          通知はありません。
        </div>
      ) : (
        <NotificationList notifications={notifications} />
      )}
    </div>
  )
}

export default NotificationPage
