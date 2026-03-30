/**
 * Mock for @nostr-dev-kit/ndk
 *
 * Kent C. Dodds: mock at the boundary. NDK is the external network layer
 * — we don't need real relay connections in component tests.
 */

export const NDKKind = {
  Metadata: 0,
  Text: 1,
  RecommendRelay: 2,
  Contacts: 3,
  EncryptedDirectMessage: 4,
  EventDeletion: 5,
  Repost: 6,
  Reaction: 7,
  BadgeAward: 8,
  ChannelCreation: 40,
  ChannelMetadata: 41,
  ChannelMessage: 42,
  ChannelHideMessage: 43,
  ChannelMuteUser: 44,
  Zap: 9735,
  ZapRequest: 9734,
} as const

export class NDKEvent {
  id = ''
  pubkey = ''
  kind = 1
  content = ''
  tags: string[][] = []
  created_at = 0
  author = { npub: '', pubkey: '' }

  rawEvent() {
    return {
      id: this.id,
      pubkey: this.pubkey,
      kind: this.kind,
      content: this.content,
      tags: this.tags,
      created_at: this.created_at,
    }
  }
}

export class NDKUser {
  npub = ''
  pubkey = ''
  profile: any = {}
}

export class NDKNip07Signer {
  constructor(_timeout?: number) {}
  async blockUntilReady() {}
}

export class NDKSubscription {}
export class NDKRelaySet {}

export type NDKFilter = Record<string, any>
export type NostrEvent = Record<string, any>

export default class NDK {
  constructor(_opts?: any) {}
  async connect() {}
}
