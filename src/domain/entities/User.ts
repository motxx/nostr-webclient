import { UserProfileType } from './UserProfile'

export interface UserType {
  npub: string
  pubkey: string
  profile?: UserProfileType
}

export class User implements UserType {
  npub: string = ''
  pubkey: string = ''
  profile?: UserProfileType

  constructor(data: UserType) {
    Object.assign(this, data)
  }

  static verified(user: User) {
    return !!user.profile?.nostrAddress
  }
}
