import { Notification } from '@/domain/entities/Notification'
import {
  NotificationRepository,
  SubscribeNotificationsOptions,
} from '@/domain/repositories/NotificationRepository'
import { Observable } from 'rxjs'

export class SubscribeNotifications {
  constructor(private notificationRepository: NotificationRepository) {}

  execute(options?: SubscribeNotificationsOptions): Observable<Notification> {
    return this.notificationRepository.subscribeNotifications(options)
  }
}
