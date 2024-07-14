import React from 'react'
import { Notification } from '@/domain/entities/Notification'
import UserIdLink from '@/components/ui-elements/UserIdLink'
import {
  nostrAddressSimplified,
  userNameForDisplay,
} from '@/utils/addressConverter'
import { formatDateAsString } from '@/utils/timeConverter'
import NoteItem from '@/components/NoteItem/NoteItem'

interface NotificationContentProps {
  notifications: Notification[]
}

const NotificationContent: React.FC<NotificationContentProps> = ({
  notifications,
}) => {
  const majorNotification = notifications[0]
  const majorUserName = userNameForDisplay(majorNotification.actor)
  const majorUserId = majorNotification.actor.profile?.nostrAddress
    ? nostrAddressSimplified(majorNotification.actor.profile?.nostrAddress)
    : majorNotification.actor.npub
  const majorCreatedAt = formatDateAsString(majorNotification.createdAt)

  const renderLikeNotification = () => (
    <>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {notifications.length > 1 ? (
          <>
            <UserIdLink userId={majorUserId} userName={majorUserName} />
            さんと他{notifications.length - 1}
            人があなたの投稿をいいねしました
          </>
        ) : (
          <>
            <UserIdLink userId={majorUserId} userName={majorUserName} />
            さんがあなたの投稿をいいねしました ({majorCreatedAt})
          </>
        )}
      </p>
      <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm whitespace-pre-wrap break-words">
        {majorNotification.target.text}
      </div>
    </>
  )

  const renderRepostNotification = () => (
    <>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {notifications.length > 1 ? (
          <>
            <UserIdLink userId={majorUserId} userName={majorUserName} />
            さんと他{notifications.length - 1}
            人があなたの投稿をリポストしました
          </>
        ) : (
          <>
            <UserIdLink userId={majorUserId} userName={majorUserName} />
            さんがあなたの投稿をリポストしました ({majorCreatedAt})
          </>
        )}
      </p>
      <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm whitespace-pre-wrap break-words">
        {majorNotification.target.text}
      </div>
    </>
  )

  const renderZapNotification = () => (
    <>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {notifications.length > 1 ? (
          <>
            <UserIdLink userId={majorUserId} userName={majorUserName} />
            さんと他{notifications.length - 1}
            人があなたの投稿に合計
            {notifications.reduce((acc, notification) => {
              return acc + notification.target.reactions.zapsAmount
            }, 0)}
            satsをzapしました
          </>
        ) : (
          <>
            <UserIdLink userId={majorUserId} userName={majorUserName} />
            さんがあなたの投稿に
            {majorNotification.target.reactions.zapsAmount}
            satsをzapしました ({majorCreatedAt})
          </>
        )}
      </p>
      <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm whitespace-pre-wrap break-words">
        {majorNotification.target.text}
      </div>
    </>
  )

  const renderReplyNotification = () => (
    <NoteItem note={majorNotification.target} onToggleFollow={() => false} />
  )

  const renderDislikeNotification = () => (
    <>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {notifications.length > 1 ? (
          <>
            <UserIdLink userId={majorUserId} userName={majorUserName} />
            さんと他{notifications.length - 1}
            人があなたの投稿をdislikeしました
          </>
        ) : (
          <>
            <UserIdLink userId={majorUserId} userName={majorUserName} />
            さんがあなたの投稿をdislikeしました ({majorCreatedAt})
          </>
        )}
      </p>
      <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm whitespace-pre-wrap break-words">
        {majorNotification.target.text}
      </div>
    </>
  )

  const renderCustomReactionNotification = () => (
    <>
      <p className="text-gray-700 dark:text-gray-300 text-sm">
        {notifications.length > 1 ? (
          <>
            <UserIdLink userId={majorUserId} userName={majorUserName} />
            さんと他{notifications.length - 1}
            人があなたの投稿に{notifications[0].customReaction}しました
          </>
        ) : (
          <>
            <UserIdLink userId={majorUserId} userName={majorUserName} />
            さんがあなたの投稿に{notifications[0].customReaction}しました (
            {majorCreatedAt})
          </>
        )}
      </p>
      <div className="text-gray-600 dark:text-gray-400 mt-2 text-sm whitespace-pre-wrap break-words">
        {majorNotification.target.text}
      </div>
    </>
  )

  switch (majorNotification.type) {
    case 'like':
      return renderLikeNotification()
    case 'dislike':
      return renderDislikeNotification()
    case 'custom-reaction':
      return renderCustomReactionNotification()
    case 'repost':
      return renderRepostNotification()
    case 'zap':
      return renderZapNotification()
    case 'reply':
      return renderReplyNotification()
    default:
      return null
  }
}

export default NotificationContent
