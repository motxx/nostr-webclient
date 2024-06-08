export class UserSettings {
  constructor(
    public readonly connectionUri: string,
    public readonly walletAuthUri: string,
    public zapAmount: number
  ) {}
}
