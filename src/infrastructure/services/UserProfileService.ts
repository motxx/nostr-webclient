import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { UserProfile } from '@/domain/entities/UserProfile'
import { UserExternalLinks } from '@/domain/entities/UserExternalLinks'
import { NostrClient } from '../nostr/nostrClient'
import {
  getNpubFromNostrAddressCache,
  getUserProfileCache,
  setNpubFromNostrAddressCache,
  setUserProfileCache,
} from '@/state/actions'
import { catchError, Observable, of, switchMap, throwError } from 'rxjs'

export class UserProfileService implements UserProfileRepository {
  nostrClient: NostrClient

  constructor(nostrClient: NostrClient) {
    this.nostrClient = nostrClient
  }

  fetchProfile(npub: string): Observable<UserProfile> {
    const cachedProfile = getUserProfileCache(npub)
    if (cachedProfile) {
      return of(cachedProfile)
    }

    return this.nostrClient.getUserWithProfile(npub).pipe(
      switchMap((user) => {
        const profile = user.profile
        const userProfile = new UserProfile({
          name: profile?.displayName || profile?.name,
          nostrAddress: profile?.nip05,
          lightningAddress: profile?.lud16,
          image: profile?.image,
          bio: profile?.bio || profile?.about,
          banner: profile?.banner,
          links: new UserExternalLinks({
            website: profile?.website,
          }),
        })

        if (userProfile.nostrAddress) {
          setNpubFromNostrAddressCache(userProfile.nostrAddress, npub)
        }
        setUserProfileCache(npub, userProfile)

        return of(userProfile)
      }),
      catchError((error) => {
        console.error('Failed to fetch user profile:', error)
        return of(
          new UserProfile({
            name: 'Unknown User',
            nostrAddress: '',
            lightningAddress: '',
            image: '',
            bio: '',
            banner: '',
            links: new UserExternalLinks({ website: '' }),
          })
        )
      })
    )
  }

  fetchNpubFromNostrAddress(nostrAddress: string): Observable<string> {
    const cachedNpub = getNpubFromNostrAddressCache(nostrAddress)
    if (cachedNpub) {
      return of(cachedNpub)
    }

    return this.nostrClient.getUserFromNip05(nostrAddress).pipe(
      switchMap((user) => {
        if (!user) {
          return throwError(
            () => new Error('fetchNpubFromNostrAddress. User not found')
          )
        }
        setNpubFromNostrAddressCache(nostrAddress, user.npub)
        return of(user.npub)
      })
    )
  }
}
