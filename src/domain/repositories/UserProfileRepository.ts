import { Observable } from 'rxjs'
import { UserProfile } from '../entities/UserProfile'

export interface UserProfileRepository {
  fetchProfile(npub: string): Observable<UserProfile>
  fetchNpubFromNostrAddress(nostrAddress: string): Observable<string>
}
