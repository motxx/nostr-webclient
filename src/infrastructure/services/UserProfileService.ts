import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { UserProfile } from '@/domain/entities/UserProfile'
import { UserExternalLinks } from '@/domain/entities/UserExternalLinks'
import { NostrClient } from '../nostr/nostrClient'
import { getUserProfileCache, setUserProfileCache } from '@/state/actions'

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

    const user = await this.nostrClient.getUser(npub)
    const profile = await user.fetchProfile().catch(() => null)

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

    setUserProfileCache(npub, userProfile)

    return userProfile
  }

  async fetchNpubFromNostrAddress(nostrAddress: string): Promise<string> {
    const user = await this.nostrClient.getUserFromNip05(nostrAddress)
    if (!user) {
      throw new Error('User not found')
    }
    return user.npub
  }
}
