import React from 'react'
import { Notification } from '@/domain/entities/Notification'
import NotificationIcon from './NotificationIcon'
import UserAvatarStack from '@/components/ui-parts/UserAvatarStack'
import NotificationContent from './NotificationContent'

interface NotificationItemProps {
  notifications: Notification[]
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notifications,
}) => {
  const majorNotification = notifications[0]

  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
      {majorNotification.type !== 'reply' && (
        <div className="flex items-center">
          <div className="mr-4">
            <NotificationIcon
              type={majorNotification.type}
              customReaction={majorNotification.customReaction}
            />
          </div>
          <UserAvatarStack
            users={notifications.map((n) => ({
              image: n.actor.profile?.image,
              name: n.actor.profile?.name || n.actor.npub,
            }))}
            size={8}
          />
        </div>
      )}
      <div
        className={`ml-10 flex-1 ${majorNotification.type === 'reply' ? '' : 'mt-2'}`}
      >
        <NotificationContent notifications={notifications} />
      </div>
    </div>
  )
}

export default NotificationItem
