import { ResultAsync } from 'neverthrow'
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
  ): ResultAsync<Notification[], Error>
  subscribeNotifications(
    options?: SubscribeNotificationsOptions
  ): Observable<Notification>
}
