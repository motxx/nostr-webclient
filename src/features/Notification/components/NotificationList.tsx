import React from 'react'
import NotificationItem from './NotificationItem'
import { Notification } from '@/domain/entities/Notification'

interface NotificationListProps {
  notifications: Notification[]
}

const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
}) => {
  const groupedNotifications = notifications.reduce(
    (acc, notification) => {
      if (!acc[notification.target.text]) {
        acc[notification.target.text] = []
      }
      acc[notification.target.text].push(notification)
      return acc
    },
    {} as { [key: string]: Notification[] }
  )

  return (
    <div className="bg-white dark:bg-black border-t border-b md:border border-gray-200 dark:border-gray-700 md:rounded-md mb-20 sm:mb-0">
      {Object.values(groupedNotifications).map((notificationGroup, index) => (
        <NotificationItem key={index} notifications={notificationGroup} />
      ))}
    </div>
  )
}

export default NotificationList
