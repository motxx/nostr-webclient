import { UserSettingsRepository } from '@/domain/repositories/UserRepository'

export class SubscribeNWARequest {
  constructor(private userSettingsRepository: UserSettingsRepository) {}

  async execute(onNWARequest: (connectionUri: string) => void) {
    this.userSettingsRepository.subscribeNWARequest(onNWARequest)
  }
}
