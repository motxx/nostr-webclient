import { DirectMessage } from './DirectMessage'
import { User } from './User'
import { nip44 } from 'nostr-tools'
import { NDKKind } from '@nostr-dev-kit/ndk'

export interface GiftWrapType {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: Array<[string, string, string?]>
  content: string
  sig: string
}

export class GiftWrap implements GiftWrapType {
  constructor(public readonly data: GiftWrapType) {}

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
  ): Promise<GiftWrap> {
    const randomKeyPair = nip44.utils.generateRandomKeys()
    const sealedEvent = await Seal.create(message, sender, receiver)
    const giftWrappedContent = await nip44.encrypt(
      JSON.stringify(sealedEvent),
      randomKeyPair.privateKey,
      receiver.pubkey
    )

    return new GiftWrap({
      id: '', // This will be set when the event is created
      pubkey: randomKeyPair.publicKey,
      created_at: Math.floor(Date.now() / 1000 - Math.random() * 172800), // Random time up to 2 days in the past
      kind: NDKKind.GiftWrap,
      tags: [['p', receiver.pubkey]],
      content: giftWrappedContent,
      sig: '', // This will be set when the event is signed
    })
  }
}
