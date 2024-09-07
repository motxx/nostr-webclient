import { NDKEvent, NostrEvent } from '@nostr-dev-kit/ndk'
import { User } from './User'
import { generateEventId } from '@/infrastructure/nostr/utils'
import { Participant } from './Participant'
import { hexToBech32 } from '@/utils/addressConverter'
import { ok, err, Result } from 'neverthrow'
import { NDKKind_DirectMessage } from '@/infrastructure/nostr/kindExtensions'

// https://github.com/nostr-protocol/nips/blob/7dfb11b435a903c703bc38216eca805cefa494d4/17.md
// Private Direct Messages
export interface DirectMessageType {
  id: string
  sender: User
  receivers: Participant[]
  content: string // message in plain text
  subject?: string // conversation title
  createdAt: Date
  replyTo?: string
}

export class DirectMessage implements DirectMessageType {
  constructor(public readonly data: DirectMessageType) {}

  get id(): string {
    return this.data.id
  }
  get sender(): User {
    return this.data.sender
  }
  get receivers(): Participant[] {
    return this.data.receivers
  }
  get content(): string {
    return this.data.content
  }
  get subject(): string | undefined {
    return this.data.subject
  }
  get json(): string {
    return JSON.stringify(this.toNostrEvent())
  }
  get createdAt(): Date {
    return this.data.createdAt
  }
  get replyTo(): string | undefined {
    return this.data.replyTo
  }

  static create(
    sender: User,
    receivers: Participant[],
    content: string,
    subject?: string,
    replyTo?: string
  ): DirectMessage {
    const tags = receivers.map((receiver) => [
      'p',
      receiver.user.pubkey,
      receiver.relay,
    ])
    if (subject) {
      tags.push(['subject', subject])
    }
    if (replyTo) {
      tags.push(['e', replyTo, '', 'reply'])
    }
    const rawNostrEvent = {
      pubkey: sender.pubkey,
      created_at: new Date().getTime() / 1000,
      kind: NDKKind_DirectMessage,
      tags,
      content,
    }
    const id = generateEventId(rawNostrEvent)
    return new DirectMessage({
      id,
      sender,
      receivers,
      content,
      subject,
      createdAt: new Date(rawNostrEvent.created_at * 1000),
      replyTo,
    })
  }

  static fromNostrEvent(event: NostrEvent): Result<DirectMessage, Error> {
    const npubResult = hexToBech32(event.pubkey, 'npub')
    if (npubResult.isErr()) {
      return err(npubResult.error)
    }
    const id = generateEventId(event)
    const sender = new User({
      npub: npubResult.value,
      pubkey: event.pubkey,
    })
    const receiversResult = event.tags
      .filter((tag) => tag[0] === 'p')
      .map((tag) => {
        const npubResult = hexToBech32(tag[1], 'npub')
        if (npubResult.isErr()) return err(npubResult.error)
        return ok(
          new Participant(
            new User({ npub: npubResult.value, pubkey: tag[1] }),
            /* tag[2] ||*/ 'wss://relay.hakua.xyz' // TODO: リレーURLを修正
          )
        )
      })
      .reduce(
        (acc, result) => {
          if (acc.isErr()) return acc
          if (result.isErr()) return result
          return ok([...acc.value, result.value])
        },
        ok([]) as Result<Participant[], Error>
      )

    if (receiversResult.isErr()) {
      return err(receiversResult.error)
    }

    const receivers = receiversResult.value
    const subject = event.tags.find((tag) => tag[0] === 'subject')?.[1]
    const replyTo = event.tags.find(
      (tag) => tag[0] === 'e' && tag[3] === 'reply'
    )?.[1]

    return ok(
      new DirectMessage({
        id,
        sender,
        receivers,
        content: event.content,
        subject,
        createdAt: new Date(event.created_at * 1000),
        replyTo,
      })
    )
  }

  static fromNDKEvent(event: NDKEvent): Result<DirectMessage, Error> {
    const nostrEvent = event.rawEvent()
    return this.fromNostrEvent(nostrEvent)
  }

  toNostrEvent(): NostrEvent {
    const tags = this.receivers.map((receiver) => [
      'p',
      receiver.user.pubkey,
      receiver.relay,
    ])
    if (this.subject) {
      tags.push(['subject', this.subject])
    }
    if (this.replyTo) {
      tags.push(['e', this.replyTo, '', 'reply'])
    }
    return {
      id: this.id,
      pubkey: this.sender.pubkey,
      created_at: this.createdAt.getTime() / 1000,
      kind: 14,
      tags,
      content: this.content,
      // unsignedKind14
      // https://github.com/nostr-protocol/nips/blob/744bce8fcae0aca07b936b6662db635c8b4253dd/17.md#encrypting
      sig: '',
    }
  }
}
