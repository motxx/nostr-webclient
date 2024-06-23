import { UserProfileRepository } from '@/domain/repositories/UserProfileRepository'
import { UserProfile } from '@/domain/entities/UserProfile'
import { UserExternalLinks } from '@/domain/entities/UserExternalLinks'
import { NostrClient } from '../nostr/nostrClient'
import { getUserProfileCache, setUserProfileCache } from '@/state/actions'
import { NDKUser } from '@nostr-dev-kit/ndk'

const PROFILE_FETCH_TIMEOUT = 1000 // 1 seconds
const MAX_RETRIES = 3
const RETRY_DELAY = 100 // 0.1 seconds

export class UserProfileService implements UserProfileRepository {
  nostrClient: NostrClient

  constructor(nostrClient: NostrClient) {
    this.nostrClient = nostrClient
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  private async fetchProfileWithRetry(
    user: NDKUser,
    retries = 0
  ): Promise<any> {
    try {
      const fetchProfileWithTimeout = async () => {
        return Promise.race([
          user.fetchProfile(),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('Profile fetch timeout')),
              PROFILE_FETCH_TIMEOUT
            )
          ),
        ])
      }

      return await fetchProfileWithTimeout()
    } catch (error) {
      console.error(`Error fetching profile (attempt ${retries + 1}):`, error)
      if (retries < MAX_RETRIES - 1) {
        console.log(`Retrying in ${RETRY_DELAY / 1000} seconds...`)
        await this.delay(RETRY_DELAY)
        return this.fetchProfileWithRetry(user, retries + 1)
      } else {
        throw error
      }
    }
  }

  async fetchProfile(npub: string): Promise<UserProfile> {
    const cachedProfile = getUserProfileCache(npub)
    if (cachedProfile) {
      return cachedProfile
    }

    const user = await this.nostrClient.getUser(npub)

    try {
      const profile = await this.fetchProfileWithRetry(user)

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
    } catch (error) {
      console.error('All profile fetch attempts failed:', error)
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
    const user = await this.nostrClient.getUserFromNip05(nostrAddress)
    if (!user) {
      throw new Error('User not found')
    }
    return user.npub
  }
}
