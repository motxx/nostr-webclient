import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Notification } from '@/domain/entities/Notification'
import { AuthStatus, authStatusAtom } from '@/state/auth'
import { notificationServiceAtom } from '@/state/services'
import {
  notificationsAtom,
  notificationsLoadingAtom,
} from '@/state/notifications'

export const useNotifications = () => {
  const authStatus = useAtomValue(authStatusAtom)
  const notificationService = useAtomValue(notificationServiceAtom)
  const notifications = useAtomValue(notificationsAtom)
  const isLoading = useAtomValue(notificationsLoadingAtom)
  const setNotifications = useSetAtom(notificationsAtom)
  const setIsLoading = useSetAtom(notificationsLoadingAtom)

  useEffect(() => {
    if (
      authStatus !== AuthStatus.ClientReady &&
      authStatus !== AuthStatus.LoggedIn
    ) {
      return
    }
    if (!notificationService) return

    const unsubscribeResult = notificationService.subscribeNotifications(
      (notification: Notification) => {
        setNotifications((prev) => [...prev, notification])
        setIsLoading(false)
      },
      { limit: 1000 }
    )

    return () => {
      unsubscribeResult.match(
        (sub) => sub.unsubscribe(),
        () => {}
      )
    }
  }, [authStatus, notificationService, setNotifications, setIsLoading])

  return { notifications, isLoading }
}
