import { UserSettings } from '@/domain/entities/UserSettings'
import {
  UserRepository,
  UserSettingsRepository,
} from '@/domain/repositories/UserRepository'

export class UpdateMyUserSettings {
  constructor(
    private userRepository: UserRepository,
    private userSettingsRepository: UserSettingsRepository
  ) {}

  async execute(settings: UserSettings): Promise<UserSettings> {
    const user = await this.userRepository.fetch()
    return this.userSettingsRepository.updateSettings(user.npub, settings)
  }
}
