import { UserExternalLinks } from './UserExternalLinks'

export interface UserProfileType {
  name?: string
  displayName?: string
  image?: string
  banner?: string
  bio?: string
  nostrAddress?: string // NIP-05
  lightningAddress?: string // LUD-16
  links?: UserExternalLinks
  followersCount?: number
  followingCount?: number
}

export class UserProfile implements UserProfileType {
  name?: string
  displayName?: string
  image?: string
  banner?: string
  bio?: string
  nostrAddress?: string // NIP-05
  lightningAddress?: string // LUD-16
  links?: UserExternalLinks
  followersCount?: number
  followingCount?: number

  constructor(data: UserProfileType) {
    Object.assign(this, data)
  }
}
