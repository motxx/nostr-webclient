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
}
