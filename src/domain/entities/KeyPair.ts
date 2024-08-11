import { randomBytes } from 'crypto'
import * as secp256k1 from '@noble/secp256k1'

export class KeyPair {
  constructor(
    public readonly privateKey: Uint8Array,
    public readonly publicKey: Uint8Array
  ) {}

  private static generatePrivateKey(): Uint8Array {
    return new Uint8Array(randomBytes(32))
  }

  private static getPublicKey(privateKey: Uint8Array): Uint8Array {
    const pubKey = secp256k1.getPublicKey(privateKey, true)
    return new Uint8Array(pubKey)
  }

  static generate(): KeyPair {
    const privateKey = this.generatePrivateKey()
    const publicKey = this.getPublicKey(privateKey)
    return new KeyPair(privateKey, publicKey)
  }
}
