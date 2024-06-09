import React from 'react'
import { FiRepeat } from 'react-icons/fi'
import { AiFillThunderbolt } from 'react-icons/ai'
import { NotificationNoteItemType } from '@/global/types'
import NoteItem from '@/components/NoteItem/NoteItem'
import notificationList from '@/data/dummy-notifications'
import { BsHeartFill } from 'react-icons/bs'
import UserIdLink from '@/components/ui-elements/UserIdLink'

const NotificationPage: React.FC = () => {
  const groupedNotifications = notificationList.reduce(
    (acc, notification) => {
      if (!acc[notification.content]) {
        acc[notification.content] = []
      }
      acc[notification.content].push(notification)
      return acc
    },
    {} as { [key: string]: NotificationNoteItemType[] }
  )

  const renderNotificationContent = (
    notifications: NotificationNoteItemType[]
  ) => {
    switch (notifications[0].type) {
      case 'like':
        return (
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {notifications.length > 1 ? (
                <>
                  <UserIdLink userId={notifications[0].userName} />
                  さんと他{notifications.length - 1}
                  人があなたの投稿をいいねしました
                </>
              ) : (
                <>
                  <UserIdLink userId={notifications[0].userName} />
                  さんがあなたの投稿をいいねしました (
                  {notifications[0].timestamp})
                </>
              )}
            </p>
            <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              {notifications[0].content}
            </div>
          </div>
        )
      case 'repost':
        return (
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {notifications.length > 1 ? (
                <>
                  <UserIdLink userId={notifications[0].userName} />
                  さんと他{notifications.length - 1}
                  人があなたの投稿をリノートしました
                </>
              ) : (
                <>
                  <UserIdLink userId={notifications[0].userName} />
                  さんがあなたの投稿をリノートしました (
                  {notifications[0].timestamp})
                </>
              )}
            </p>
            <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              {notifications[0].content}
            </div>
          </div>
        )
      case 'zap':
        return (
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {notifications.length > 1 ? (
                <>
                  <UserIdLink userId={notifications[0].userName} />
                  さんと他{notifications.length - 1}
                  人があなたの投稿に合計
                  {notifications.reduce((acc, notification) => {
                    return acc + notification.zaps
                  }, 0)}
                  satsをzapしました
                </>
              ) : (
                <>
                  <UserIdLink userId={notifications[0].userName} />
                  さんがあなたの投稿に
                  {notifications[0].zaps}
                  satsをzapしました ({notifications[0].timestamp})
                </>
              )}
            </p>
            <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              {notifications[0].content}
            </div>
          </div>
        )
      case 'reply':
        return (
          <div>
            <NoteItem note={notifications[0]} onToggleFollow={() => false} />
          </div>
        )
      default:
        return null
    }
  }

  const renderNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <BsHeartFill className="text-red-500 w-6 h-6" />
      case 'repost':
        return <FiRepeat className="text-green-500 w-6 h-6" />
      case 'zap':
        return <AiFillThunderbolt className="text-yellow-500 w-6 h-6" />
      default:
        return null
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-4">
      <h2 className="text-xl font-bold ml-2 mb-4 text-gray-700 dark:text-gray-300">
        通知
      </h2>
      <div className="bg-white dark:bg-black border-t border-b md:border border-gray-200 dark:border-gray-700 md:rounded-md mb-20 sm:mb-0">
        {Object.values(groupedNotifications).map((notifications, index) => (
          <div
            key={index}
            className="p-4 border-b border-gray-200 dark:border-gray-700"
          >
            {notifications[0].type !== 'reply' && (
              <div className="flex items-center">
                <div className="mr-4">
                  {renderNotificationIcon(notifications[0].type!)}
                </div>
                <div className="flex -space-x-2">
                  {notifications.map((notification, idx) => (
                    <img
                      key={idx}
                      src={notification.userImage}
                      alt={`${notification.userName}'s profile`}
                      className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                      style={{ zIndex: notifications.length - idx }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div
              className={`ml-10 flex-1 ${notifications[0].type === 'reply' ? '' : 'mt-2'}`}
            >
              {renderNotificationContent(notifications)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NotificationPage
