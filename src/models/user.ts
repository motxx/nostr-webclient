import { UserSettingsType, UserType } from '../global/types'

export class User implements UserType {
  npub: string = ''
  pubkey: string = ''
  name: string = ''
  bio: string = ''
  image?: string
  followersCount?: number
  followingCount?: number
  headerImage?: string
  settings?: UserSettingsType

  constructor(data: UserType) {
    Object.assign(this, data)
  }
}
