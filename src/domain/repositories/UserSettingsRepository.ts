import { UserSettings } from '../entities/UserSettings'

export interface UserSettingsRepository {
  fetchUserSettings(npub: string): Promise<UserSettings>
  updateSettings(npub: string, settings: UserSettings): Promise<UserSettings>

  subscribeNWARequest(
    onNWARequest: (connectionUri: string) => void
  ): Promise<void>
}
