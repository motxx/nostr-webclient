import { UserProfileType } from './UserProfile'
import { UserSettingsType } from './UserSettings'

export interface UserType {
  npub: string
  pubkey: string
  profile?: UserProfileType
  settings?: UserSettingsType
  followingUsers?: UserType[]
}

export class User implements UserType {
  npub: string = ''
  pubkey: string = ''
  profile?: UserProfileType
  settings?: UserSettingsType
  followingUsers?: UserType[]

  constructor(data: UserType) {
    Object.assign(this, data)
  }

  static verified(user: User) {
    return !!user.profile?.nostrAddress
  }
}
