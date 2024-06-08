import { UserService } from '@/infrastructure/services/UserService'
import { WalletService } from '@/infrastructure/services/WalletService'

export interface SendZapResponse {
  success: boolean
  preimage: string
  message?: string
}

export class SendZap {
  constructor(
    private readonly walletService: WalletService,
    private userService: UserService
  ) {}

  /**
   * Execute send zap
   * @param to NIP-05 identifier
   * @param sats amount sats to zap
   * @returns
   */
  async execute(to: string, sats: number): Promise<SendZapResponse> {
    const { pr: invoice, successAction } =
      await this.userService.sendZapRequest(to, sats)
    const { preimage } = await this.walletService.sendPayment(invoice)
    // TODO: MAY fetch zap receipt
    if (
      successAction &&
      successAction.tag === 'message' &&
      successAction.message
    ) {
      return { success: true, preimage, message: successAction.message }
    }
    return { success: true, preimage }
  }
}
