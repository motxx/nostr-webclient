import React from 'react'
import { FiRepeat } from 'react-icons/fi'
import { AiFillThunderbolt } from 'react-icons/ai'
import NoteItem from '@/components/NoteItem/NoteItem'
import notificationList from '@/data/dummy-notifications'
import { BsHeartFill } from 'react-icons/bs'
import UserIdLink from '@/components/ui-elements/UserIdLink'
import { NoteType, NotificationNoteType } from '@/domain/entities/Note'
import { userIdForDisplay, userNameForDisplay } from '@/utils/addressConverter'
import { formatDateAsString } from '@/utils/timeConverter'

const NotificationPage: React.FC = () => {
  const groupedNotifications = notificationList.reduce(
    (acc, notification) => {
      if (!acc[notification.text]) {
        acc[notification.text] = []
      }
      acc[notification.text].push(notification)
      return acc
    },
    {} as { [key: string]: NotificationNoteType[] }
  )

  const renderNotificationContent = (notes: NotificationNoteType[]) => {
    const majorNote = notes[0]
    const majorUserName = userNameForDisplay(majorNote.author)
    const majorCreatedAt = formatDateAsString(majorNote.created_at)
    switch (majorNote.type) {
      case 'like':
        return (
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {notes.length > 1 ? (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんと他{notes.length - 1}
                  人があなたの投稿をいいねしました
                </>
              ) : (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんがあなたの投稿をいいねしました ({majorCreatedAt})
                </>
              )}
            </p>
            <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              {majorNote.text}
            </div>
          </div>
        )
      case 'repost':
        return (
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {notes.length > 1 ? (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんと他{notes.length - 1}
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
              {majorNote.text}
            </div>
          </div>
        )
      case 'zap':
        return (
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-sm">
              {notes.length > 1 ? (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんと他{notes.length - 1}
                  人があなたの投稿に合計
                  {notes.reduce((acc, note) => {
                    return acc + note.zaps
                  }, 0)}
                  satsをzapしました
                </>
              ) : (
                <>
                  <UserIdLink userId={majorUserName} />
                  さんがあなたの投稿に
                  {majorNote.zaps}
                  satsをzapしました ({majorCreatedAt})
                </>
              )}
            </p>
            <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
              {majorNote.text}
            </div>
          </div>
        )
      case 'reply':
        const note: NoteType = { ...majorNote }
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
                      src={notification.author.profile?.image ?? ''}
                      alt={`${notification.author.npub}'s profile`}
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
