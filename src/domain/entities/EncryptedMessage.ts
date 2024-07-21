import { Signer } from 'nostr-login/dist/modules/Nostr'
import { DirectMessage } from './DirectMessage'
import { GiftWrap } from './GiftWrap'
import { User } from './User'
import { Seal, SealType } from './Seal'
import { NostrEvent } from '@nostr-dev-kit/ndk'

export class EncryptedMessage {
  constructor(public readonly giftWrap: GiftWrap) {}

  static async encrypt(
    message: DirectMessage,
    sender: User,
    receiver: User
  ): Promise<EncryptedMessage> {
    const giftWrap = await GiftWrap.create(message, sender, receiver)
    return new EncryptedMessage(giftWrap)
  }

  async decrypt(receiver: Signer): Promise<DirectMessage> {
    const giftWrapContent = await receiver.nip44.decrypt(
      this.giftWrap.pubkey,
      this.giftWrap.content
    )
    const sealedEvent: SealType = JSON.parse(giftWrapContent)
    const seal = new Seal(sealedEvent)

    const messageContent = await receiver.nip44.decrypt(
      seal.pubkey,
      seal.content
    )
    const messageEvent: NostrEvent = JSON.parse(messageContent)

    return DirectMessage.fromNostrEvent(messageEvent)
  }
}
