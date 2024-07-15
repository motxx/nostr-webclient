import { User } from './User'

export interface PublicChannelType {
  id: string
  name: string
  description?: string
  picture?: string
  created_at: Date
  updated_at: Date
}

export class PublicChannel implements PublicChannelType {
  constructor(public readonly data: PublicChannelType) {}

  get id(): string {
    return this.data.id
  }

  get name(): string {
    return this.data.name
  }

  get description(): string | undefined {
    return this.data.description
  }

  get picture(): string | undefined {
    return this.data.picture
  }

  get created_at(): Date {
    return this.data.created_at
  }

  get updated_at(): Date {
    return this.data.updated_at
  }
}

export interface PublicChatMessageType {
  id: string
  channel_id: string
  author: User
  content: string
  created_at: Date
}

export class PublicChatMessage implements PublicChatMessageType {
  constructor(public readonly data: PublicChatMessageType) {}

  get id(): string {
    return this.data.id
  }

  get channel_id(): string {
    return this.data.channel_id
  }

  get author(): User {
    return this.data.author
  }

  get content(): string {
    return this.data.content
  }

  get created_at(): Date {
    return this.data.created_at
  }
}
