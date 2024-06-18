import { NDKEvent } from '@nostr-dev-kit/ndk'
import { BudgetPeriod } from '@/domain/use_cases/GenerateWalletAuthUri'
import { NostrClientConnectError } from '@/infrastructure/nostr/nostrErrors'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'

/**
 * NIP-67: Nostr Wallet Auth
 * Share NWC connection URI by negotiating the secret over Nostr.
 * https://github.com/nostr-protocol/nips/pull/851
 * https://blog.mutinywallet.com/nostr-wallet-auth/
 */
export class NostrWalletAuth {
  #nostrClient: NostrClient
  // #nwcSigner?: NDKSigner;

  static readonly ClientProfileNpub =
    import.meta.env.VITE_NOSTR_CLIENT_PROFILE_NPUB || ''

  private constructor(nostrClient: NostrClient) {
    this.#nostrClient = nostrClient
  }

  /**
   * Initialize NostrWalletAuth
   * @returns Promise<NostrWalletAuth>
   */
  static async connect(): Promise<NostrWalletAuth> {
    const nostrClient = await NostrClient.connect().catch((error) => {
      throw new NostrClientConnectError(error)
    })
    return new NostrWalletAuth(nostrClient)
  }

  /**
   * Generate nostr+walletauth URI
   * @returns Promise<string>
   */
  async generateAuthUri(budget: number, period: BudgetPeriod) {
    const pubkey = await this.#nostrClient.getPublicKey()
    const url = new URL(`nostr+walletauth://${pubkey}`)
    for (const relay of NostrClient.Relays) {
      url.searchParams.append('relay', relay)
    }
    const genRndHex = (size: number) =>
      [...Array(size)]
        .map(() => Math.floor(Math.random() * 16).toString(16))
        .join('')

    const secret = genRndHex(32)
    //this.#nwcSigner = new NDKPrivateKeySigner(secret);

    url.searchParams.append('secret', secret)
    url.searchParams.append(
      'required_commands',
      encodeURIComponent(
        'pay_invoice'
        // not supported yet
        // ["pay_invoice", "pay_keysend", "make_invoice", "lookup_invoice"].join(" ")
      )
    )
    // not supported yet
    // url.searchParams.append("optional_commands", "list_transactions");
    url.searchParams.append('budget', `${budget}/${period}`)
    url.searchParams.append('identity', NostrWalletAuth.ClientProfileNpub)
    const authUri = url.toString().replace(/%2520/g, '%20')
    return authUri
  }

  /**
   * Decrypt NWA request
   * Example of decrypted event.content:
   * "{\"secret\":\"53fe717e39e145f20539fe8f5baaebb0\",\"commands\":[\"pay_invoice\"],\"relay\":\"wss://relay.mutinywallet.com\"}"
   * @param event NDKEvent
   * @returns connectionURI
   */
  async decryptNWARequest(event: NDKEvent): Promise<string> {
    const decrypted = await this.#nostrClient.decryptEvent(event)
    const content = JSON.parse(decrypted.content)
    console.log('decrypted NWARequest content', content)
    const pubkey = await this.#nostrClient.getLoggedInUserPubkey()
    const lud16 = await this.#nostrClient.getLoggedInUserLud16()
    const uri = new URL(`nostr+walletconnect://${pubkey}`)
    uri.searchParams.append('relay', content.relay)
    uri.searchParams.append('secret', content.secret)
    if (lud16) {
      uri.searchParams.append('lud16', lud16)
    }
    const uriString = uri.toString()
    console.log('connection URI', uriString)
    return uriString
  }
}
