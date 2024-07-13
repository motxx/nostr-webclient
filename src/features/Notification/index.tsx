import React, { useEffect, useState } from 'react'
import { FiRepeat } from 'react-icons/fi'
import { AiFillThunderbolt } from 'react-icons/ai'
import NoteItem from '@/components/NoteItem/NoteItem'
import { BsHeartFill } from 'react-icons/bs'
import UserIdLink from '@/components/ui-elements/UserIdLink'
import { NoteType } from '@/domain/entities/Note'
import { userNameForDisplay } from '@/utils/addressConverter'
import { formatDateAsString } from '@/utils/timeConverter'
import { useNostrClient } from '@/hooks/useNostrClient'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { NoteService } from '@/infrastructure/services/NoteService'
import { NotificationService } from '@/infrastructure/services/NotificationService'
import { SubscribeNotifications } from '@/domain/use_cases/SubscribeNotifications'
import { Notification } from '@/domain/entities/Notification'

const NotificationPage: React.FC = () => {
  const { nostrClient } = useNostrClient()
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    if (!nostrClient) return

    const userProfileRepository = new UserProfileService(nostrClient)
    const noteService = new NoteService(nostrClient!, userProfileRepository)
    const notificationService = new NotificationService(
      nostrClient,
      userProfileRepository,
      noteService
    )
    const subscribeNotifications = new SubscribeNotifications(
      notificationService
    )

    const unsubscribePromise = subscribeNotifications.execute(
      (notification: Notification) => {
        setNotifications((prev: Notification[]) => [...prev, notification])
      },
      { limit: 50 } // You can adjust the limit as needed
    )

    return () => {
      unsubscribePromise.then(({ unsubscribe }) => unsubscribe())
    }
  }, [nostrClient])

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

  const renderNotificationContent = (notifications: Notification[]) => {
    const majorNotification = notifications[0]
    const majorUserName = userNameForDisplay(majorNotification.actor)
    const majorCreatedAt = formatDateAsString(majorNotification.createdAt)
    switch (majorNotification.type) {
      case 'like':
        return (
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {notifications.length > 1 ? (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんと他{notifications.length - 1}
                  人があなたの投稿を
                  {majorNotification.target.text === '+'
                    ? 'いいねしました'
                    : `${majorNotification.target.text}しました`}
                </>
              ) : (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんがあなたの投稿を
                  {majorNotification.target.text === '+'
                    ? 'いいねしました'
                    : `${majorNotification.target.text}しました`}{' '}
                  ({majorCreatedAt})
                </>
              )}
            </p>
          </div>
        )
      case 'repost':
        return (
          <div>
            <p className="text-gray-7000 dark:text-gray-300 text-sm">
              {notifications.length > 1 ? (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんと他{notifications.length - 1}
                  人があなたの投稿をリポストしました
                </>
              ) : (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんがあなたの投稿をリポストしました ({majorCreatedAt})
                </>
              )}
            </p>
            <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              {majorNotification.target.text}
            </div>
          </div>
        )
      case 'zap':
        return (
          <div>
            <p className="text-gray-700 dark:text-gray-3000 text-sm">
              {notifications.length > 1 ? (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんと他{notifications.length - 1}
                  人があなたの投稿に合計
                  {notifications.reduce((acc, notification) => {
                    return acc + notification.target.reactions.zapsAmount
                  }, 0)}
                  satsをzapしました
                </>
              ) : (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんがあなたの投稿に
                  {majorNotification.target.reactions.zapsAmount}
                  satsをzapしました ({majorCreatedAt})
                </>
              )}
            </p>
            <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              {majorNotification.target.text}
            </div>
          </div>
        )
      case 'reply':
        const note: NoteType = { ...majorNotification.target }
        return (
          <div>
            <NoteItem note={note} onToggleFollow={() => false} />
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
                      src={notification.actor.profile?.image ?? ''}
                      alt={`${notification.actor.npub}'s profile`}
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
