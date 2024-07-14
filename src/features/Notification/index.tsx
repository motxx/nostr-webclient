import React from 'react'
import NotificationList from './components/NotificationList'
import { useNotifications } from './hooks/useNotifications'

const NotificationPage: React.FC = () => {
  const { notifications } = useNotifications()

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <h2 className="text-xl font-bold ml-2 mb-4 text-gray-700 dark:text-gray-300">
        通知
      </h2>
      <NotificationList notifications={notifications} />
    </div>
  )
}

export default NotificationPage
