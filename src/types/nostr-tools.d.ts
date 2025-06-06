declare module 'nostr-tools' {
  export interface Event {
    id?: string
    pubkey: string
    created_at: number
    kind: number
    tags: string[][]
    content: string
    sig?: string
  }

  export function finalizeEvent(event: Event, privateKey: Uint8Array): Event

  export const nip44: {
    getConversationKey(privateKey: Uint8Array, publicKey: string): Uint8Array
    encrypt(plaintext: string, conversationKey: Uint8Array, nonce: Uint8Array): string
    decrypt(ciphertext: string, conversationKey: Uint8Array): string
  }
}