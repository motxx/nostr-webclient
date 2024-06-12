export interface UserSettingsType {
  connectionUri?: string
  walletAuthUri?: string
  defaultZapAmount?: number
}

export class UserSettings implements UserSettingsType {
  constructor(
    public readonly connectionUri?: string,
    public readonly walletAuthUri?: string,
    public defaultZapAmount?: number
  ) {}
}
