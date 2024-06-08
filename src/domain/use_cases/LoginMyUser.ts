import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'

export class LoginMyUser {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<User> {
    const user = await this.userRepository.login()
    const settings = await this.userRepository.fetchUserSettings(user.npub)
    return new User(user.npub, user.pubkey, user.username, user.image, settings)
  }
}
