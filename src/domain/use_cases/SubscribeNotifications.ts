import { Notification } from '@/domain/entities/Notification'
import {
  NotificationRepository,
  SubscribeNotificationsOptions,
} from '@/domain/repositories/NotificationRepository'

export class SubscribeNotifications {
  constructor(private notificationRepository: NotificationRepository) {}

  async execute(
    onNotification: (notification: Notification) => void,
    options?: SubscribeNotificationsOptions
  ): Promise<{ unsubscribe: () => void }> {
    const result = await this.notificationRepository.subscribeNotifications(
      onNotification,
      options
    )
    if (result.isOk()) {
      return result.value
    } else {
      throw result.error
    }
  }
}
