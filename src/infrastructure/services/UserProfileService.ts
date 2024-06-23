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

  async fetchProfile(npub: string): Promise<UserProfile> {
    const cachedProfile = getUserProfileCache(npub)
    if (cachedProfile) {
      return cachedProfile
    }

    try {
      const user = await this.nostrClient.getUserWithProfile(npub)
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

      return userProfile
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      // If all retries fail, return a minimal UserProfile
      return new UserProfile({
        name: 'Unknown User',
        nostrAddress: '',
        lightningAddress: '',
        image: '',
        bio: '',
        banner: '',
        links: new UserExternalLinks({ website: '' }),
      })
    }
  }

  async fetchNpubFromNostrAddress(nostrAddress: string): Promise<string> {
    const cachedNpub = getNpubFromNostrAddressCache(nostrAddress)
    if (cachedNpub) {
      return cachedNpub
    }

    const user = await this.nostrClient.getUserFromNip05(nostrAddress)
    if (!user) {
      throw new Error('User not found')
    }

    setNpubFromNostrAddressCache(nostrAddress, user.npub)

    return user.npub
  }
}
