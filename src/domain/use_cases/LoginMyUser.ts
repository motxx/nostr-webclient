import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { UserSettingsRepository } from '@/domain/repositories/UserSettingsRepository'

export class LoginMyUser {
  constructor(
    private userRepository: UserRepository,
    private userSettingsRepository: UserSettingsRepository
  ) {}

  async execute(): Promise<User> {
    const result = this.userRepository.login()
    if (result.isErr()) {
      throw result.error
    }
    const user = result.value
    const settings = await this.userSettingsRepository.fetchUserSettings(
      user.npub
    )
    return new User({
      npub: user.npub,
      pubkey: user.pubkey,
      profile: user.profile,
      settings,
    })
  }
}
