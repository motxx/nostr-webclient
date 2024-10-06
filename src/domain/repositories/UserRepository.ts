import { User } from '@/domain/entities/User'
import { Observable } from 'rxjs'

export interface UserRepository {
  login(): Observable<User>
  fetchDefaultUser(): Observable<User>
  fetchLoggedInUserFollows(): Observable<User[]>
}
