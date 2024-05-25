import { UserSettingsType, UserType } from '../global/types'

export class User implements UserType {
  npub: string = ''
  pubkey: string = ''
  name: string = ''
  image?: string
  settings?: UserSettingsType

  constructor(data: UserType) {
    Object.assign(this, data)
  }
}
