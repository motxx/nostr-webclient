import { generateSecretKey, getPublicKey } from 'nostr-tools'

export class KeyPair {
  constructor(
    public readonly privateKey: Uint8Array,
    public readonly publicKeyHex: string
  ) {}

  static generate(): KeyPair {
    const privateKey = generateSecretKey()
    return new KeyPair(privateKey, getPublicKey(privateKey))
  }
}
