import { UserSettings } from '@/domain/entities/UserSettings'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { UserSettingsRepository } from '@/domain/repositories/UserSettingsRepository'

export class UpdateMyUserSettings {
  constructor(
    private userRepository: UserRepository,
    private userSettingsRepository: UserSettingsRepository
  ) {}

  async execute(settings: UserSettings): Promise<UserSettings> {
    const user = this.userRepository.fetchLoggedInUser()
    if (user.isErr()) {
      throw new Error(String(user.error))
    }
    return this.userSettingsRepository.updateSettings(user.value.npub, settings)
  }
}
