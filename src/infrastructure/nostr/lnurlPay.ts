import { bech32 } from 'bech32'

/**
 * LUD-06: payRequest base spec.
 * https://github.com/lnurl/luds/blob/luds/06.md
 */
export type LnurlPay = {
  allowsNostr?: boolean
  nostrPubkey?: string
  callback?: string
  minSendable?: number
  maxSendable?: number
  metadata?: string
  tag?: string
  [key: string]: any
}

/**
 * Convert nip05Id to lnurlPayUrl
 * @param nip05Id
 * @returns string
 */
export const toLnurlPayUrl = (nip05Id: string) => {
  const [name, domain] = nip05Id.split('@')
  if (!name || !domain) {
    throw new Error('Invalid nip05Id')
  }
  return `https://${domain}/.well-known/lnurlp/${name}`
}

/**
 * Bech32-encode the given lnurl
 * LUD-01: Base LNURL encoding and decoding
 * @param lnurl
 * @returns string
 */
export const toBech32EncodedLnurl = (lnurl: string) => {
  const data = new TextEncoder().encode(lnurl)
  const words = bech32.toWords(data)
  return bech32.encode('lnurl', words)
}
