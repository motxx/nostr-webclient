import { Participant } from './Participant'
import { DirectMessage } from './DirectMessage'

// https://github.com/nostr-protocol/nips/blob/7dfb11b435a903c703bc38216eca805cefa494d4/17.md
// Chat Rooms
export interface ConversationType {
  id: string
  participants: Set<Participant>
  messages: DirectMessage[]
  subject?: string
  updatedAt: Date
}

export class Conversation implements ConversationType {
  constructor(public readonly data: ConversationType) {}

  get id(): string {
    return this.data.id
  }
  get participants(): Set<Participant> {
    return this.data.participants
  }
  get messages(): DirectMessage[] {
    return this.data.messages
  }
  get lastMessage(): DirectMessage | null {
    return this.data.messages.at(-1) ?? null
  }
  get subject(): string | undefined {
    return this.data.subject
  }
  get updatedAt(): Date {
    return this.data.updatedAt
  }

  static create(
    participants: Set<Participant>,
    subject?: string
  ): Conversation {
    const generateRoomId = () => {
      // ChatRoomsの識別方法のみ定義されているので、
      // ここでは、ユーザーのpubkeyをソートして結合している
      const participantsArray = Array.from(participants)
      const sortedParticipants = participantsArray.sort((a, b) =>
        a.user.pubkey.localeCompare(b.user.pubkey)
      )
      return sortedParticipants
        .map((participant) => participant.user.pubkey)
        .join('-')
    }
    return new Conversation({
      id: generateRoomId(),
      participants,
      messages: [],
      subject,
      updatedAt: new Date(),
    })
  }

  addMessage(message: DirectMessage): Conversation {
    return new Conversation({
      ...this.data,
      messages: [...this.data.messages, message],
      updatedAt: new Date(),
    })
  }
}
