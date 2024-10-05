import { useEffect, useContext, useRef } from 'react'
import { AppContext } from '@/context/AppContext'
import { AuthStatus, NotificationsStatus } from '@/context/types'
import { NotificationService } from '@/infrastructure/services/NotificationService'
import { OperationType } from '@/context/actions'
import { FetchPastNotifications } from '@/domain/use_cases/FetchPastNotifications'
import { SubscribeNotifications } from '@/domain/use_cases/SubscribeNotifications'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { NoteService } from '@/infrastructure/services/NoteService'
import { Subscription } from 'rxjs'

export const useNotifications = () => {
  const {
    auth: { nostrClient, status: authStatus },
    notifications: { notifications },
    dispatch,
  } = useContext(AppContext)

  // 再レンダリングを防ぐためにuseRefを使う(notifications.statusは依存配列に影響するので使わない)
  const subscriptionRef = useRef<Subscription | null>(null)
  const isSubscribingRef = useRef<boolean>(false)

  useEffect(() => {
    if (
      authStatus !== AuthStatus.ClientReady &&
      authStatus !== AuthStatus.LoggedIn
    ) {
      return
    }
    if (!nostrClient) {
      return
    }

    if (isSubscribingRef.current) {
      return
    }
    isSubscribingRef.current = true

    const userProfileRepository = new UserProfileService(nostrClient)
    const noteService = new NoteService(nostrClient, userProfileRepository)
    const notificationService = new NotificationService(
      nostrClient,
      userProfileRepository,
      noteService
    )

    dispatch({ type: OperationType.FetchPastNotificationsStart })

    new FetchPastNotifications(notificationService)
      .execute({ limit: 100 })
      .match(
        (notifications) => {
          dispatch({
            type: OperationType.FetchPastNotificationsEnd,
            notifications,
          })
        },
        (error) => {
          dispatch({ type: OperationType.FetchPastNotificationsError, error })
        }
      )

    const subscription = new SubscribeNotifications(notificationService)
      .execute()
      .subscribe({
        next: (notification) => {
          dispatch({ type: OperationType.AddNewNotification, notification })
        },
        error: (error) => {
          dispatch({ type: OperationType.SubscribeNotificationsError, error })
        },
      })

    subscriptionRef.current = subscription
    dispatch({ type: OperationType.SubscribeNotifications })

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        isSubscribingRef.current = false
        dispatch({ type: OperationType.UnsubscribeNotifications })
      }
    }
  }, [authStatus, nostrClient, dispatch])

  return { notifications }
}
