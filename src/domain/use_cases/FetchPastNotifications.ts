import { ResultAsync } from 'neverthrow'
import { Notification } from '@/domain/entities/Notification'
import {
  NotificationRepository,
  SubscribeNotificationsOptions,
} from '@/domain/repositories/NotificationRepository'

export class FetchPastNotifications {
  constructor(
    private readonly notificationRepository: NotificationRepository
  ) {}

  execute(
    options?: SubscribeNotificationsOptions
  ): ResultAsync<Notification[], Error> {
    return this.notificationRepository.fetchPastNotifications(options)
  }
}
