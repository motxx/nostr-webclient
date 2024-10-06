import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { UserProfile } from '@/domain/entities/UserProfile'
import { Observable } from 'rxjs'

export class FetchUserProfile {
  constructor(private userProfileRepository: UserProfileRepository) {}

  execute(npub: string): Observable<UserProfile> {
    return this.userProfileRepository.fetchProfile(npub)
  }
}
