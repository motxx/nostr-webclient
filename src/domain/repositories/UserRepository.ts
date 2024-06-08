import { User } from '@/domain/entities/User'
import { UserSettings } from '@/domain/entities/UserSettings'

export interface UserRepository {
  login(): Promise<User>
  fetch(): Promise<User>
  fetchUserSettings(userNpub: string): Promise<UserSettings>
}

export interface UserSettingsRepository {
  updateSettings(npub: string, settings: UserSettings): Promise<UserSettings>

  subscribeNWARequest(
    onNWARequest: (connectionUri: string) => void
  ): Promise<void>
}
