import { NDKKind } from '@nostr-dev-kit/ndk'

export interface SealType {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: Array<[string, string, string?]>
  content: string
  sig: string
}

export class Seal implements SealType {
  constructor(public readonly data: SealType) {}

  get id(): string {
    return this.data.id
  }
  get pubkey(): string {
    return this.data.pubkey
  }
  get created_at(): number {
    return this.data.created_at
  }
  get kind(): number {
    return this.data.kind
  }
  get tags(): Array<[string, string, string?]> {
    return this.data.tags
  }
  get content(): string {
    return this.data.content
  }
  get sig(): string {
    return this.data.sig
  }

  static async create(
    message: DirectMessage,
    sender: User,
    receiver: User
  ): Promise<Seal> {
    const encryptedContent = await nip44.encrypt(
      JSON.stringify(message.toNostrEvent()),
      sender.privateKey,
      receiver.pubkey
    )

    return new Seal({
      id: '', // This will be set when the event is created
      pubkey: sender.pubkey,
      created_at: Math.floor(Date.now() / 1000 - Math.random() * 172800), // Random time up to 2 days in the past
      kind: NDKKind.SealedMessage,
      tags: [],
      content: encryptedContent,
      sig: '', // This will be set when the event is signed
    })
  }
}
