import { UserSettingsType, UserType } from '@/global/types'

export class User implements UserType {
  npub: string = ''
  pubkey: string = ''
  nostrAddress?: string
  name: string = ''
  bio: string = ''
  image?: string
  followersCount?: number
  followingCount?: number
  headerImage?: string
  links?: Record<string, string>
  settings?: UserSettingsType

  constructor(data: UserType) {
    Object.assign(this, data)
  }
}
