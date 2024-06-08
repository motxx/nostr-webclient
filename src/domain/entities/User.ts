import { UserSettings } from '@/domain/entities/UserSettings'

export class User {
  constructor(
    public readonly npub: string,
    public readonly pubkey: string,
    public readonly username: string,
    public readonly image: string,
    public readonly settings: UserSettings
  ) {}
}
