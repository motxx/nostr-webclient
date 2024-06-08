import { WalletService } from '@/infrastructure/services/WalletService'

export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export class GenerateWalletAuthUri {
  constructor(private readonly walletService: WalletService) {}

  async execute(budget: number, period: BudgetPeriod): Promise<string> {
    await this.walletService.connectNwa()
    const uri = await this.walletService.generateAuthUri(budget, period)
    console.log({ uri })
    return uri
  }
}
