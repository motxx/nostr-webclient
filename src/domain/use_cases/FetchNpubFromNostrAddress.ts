import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { Observable } from 'rxjs'

export class FetchNpubFromNostrAddress {
  constructor(private userProfileRepository: UserProfileRepository) {}

  execute(nostrAddress: string): Observable<string> {
    return this.userProfileRepository.fetchNpubFromNostrAddress(nostrAddress)
  }
}
