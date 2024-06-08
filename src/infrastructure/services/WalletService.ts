import { BudgetPeriod } from '@/domain/use_cases/GenerateWalletAuthUri'
import { NostrWalletConnect } from '@/infrastructure/nostr/nostrWalletConnect'
import { WalletNotInitializedError } from '@/infrastructure/errors/serviceErrors'
import { NostrWalletAuth } from '@/infrastructure/nostr/nostrWalletAuth'

export interface SendPaymentResponse {
  preimage: string
}

export class WalletService {
  #nwa?: NostrWalletAuth
  #nwc?: NostrWalletConnect

  async connectNwa() {
    if (this.#nwa) {
      return
    }
    const nwa = await NostrWalletAuth.connect()
    this.#nwa = nwa
  }

  async generateAuthUri(budget: number, period: BudgetPeriod) {
    if (this.#nwa) {
      return this.#nwa.generateAuthUri(budget, period)
    }
    throw new WalletNotInitializedError()
  }

  async connectNwc(connectionUri: string) {
    if (this.#nwc) {
      return
    }
    const nwc = await NostrWalletConnect.connect(connectionUri)
    this.#nwc = nwc
  }

  async sendPayment(invoice: string): Promise<SendPaymentResponse> {
    if (!this.#nwc) {
      throw new WalletNotInitializedError()
    }
    return this.#nwc.sendPayment(invoice)
  }
}
