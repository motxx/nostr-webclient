import { useEffect, useState } from 'react'
import { useNostrClient } from '@/hooks/useNostrClient'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { NoteService } from '@/infrastructure/services/NoteService'
import { NotificationService } from '@/infrastructure/services/NotificationService'
import { SubscribeNotifications } from '@/domain/use_cases/SubscribeNotifications'
import { Notification } from '@/domain/entities/Notification'

export const useNotifications = () => {
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
      { limit: 50 }
    )

    return () => {
      unsubscribePromise.then(({ unsubscribe }) => unsubscribe())
    }
  }, [nostrClient])

  return { notifications }
}
