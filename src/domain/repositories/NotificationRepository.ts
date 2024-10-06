import { Notification } from '@/domain/entities/Notification'
import { Observable } from 'rxjs'

export type SubscribeNotificationsOptions = {
  since?: Date
  until?: Date
  limit?: number
}

export interface NotificationRepository {
  fetchPastNotifications(
    options?: SubscribeNotificationsOptions
  ): Observable<Notification>
  subscribeNotifications(
    options?: SubscribeNotificationsOptions
  ): Observable<Notification>
}
