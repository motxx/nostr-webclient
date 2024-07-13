import { ResultAsync } from 'neverthrow'
import { Notification } from '@/domain/entities/Notification'

export type SubscribeNotificationsOptions = {
  since?: Date
  until?: Date
  limit?: number
}

export interface NotificationRepository {
  subscribeNotifications(
    onNotification: (notification: Notification) => void,
    options?: SubscribeNotificationsOptions
  ): ResultAsync<{ unsubscribe: () => void }, Error>
}
