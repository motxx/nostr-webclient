import { ResultAsync, ok, err } from 'neverthrow'
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

export class UserProfileService implements UserProfileRepository {
  nostrClient: NostrClient

  constructor(nostrClient: NostrClient) {
    this.nostrClient = nostrClient
  }

  fetchProfile(npub: string): ResultAsync<UserProfile, Error> {
    const cachedProfile = getUserProfileCache(npub)
    if (cachedProfile) {
      return ResultAsync.fromPromise(
        Promise.resolve(cachedProfile),
        () => new Error('Failed to retrieve cached profile')
      )
    }

    return this.nostrClient
      .getUserWithProfile(npub)
      .andThen((user) => {
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

        return ok(userProfile)
      })
      .orElse((error) => {
        console.error('Failed to fetch user profile:', error)
        return ok(
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
  }

  fetchNpubFromNostrAddress(nostrAddress: string): ResultAsync<string, Error> {
    const cachedNpub = getNpubFromNostrAddressCache(nostrAddress)
    if (cachedNpub) {
      return ResultAsync.fromPromise(
        Promise.resolve(cachedNpub),
        () => new Error('Failed to retrieve cached npub')
      )
    }

    return this.nostrClient.getUserFromNip05(nostrAddress).andThen((user) => {
      if (!user) {
        return err(new Error('User not found'))
      }
      setNpubFromNostrAddressCache(nostrAddress, user.npub)
      return ok(user.npub)
    })
  }
}
