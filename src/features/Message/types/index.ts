export type MessageType = {
  sender: string
  avatar: string
  content: string
}

export type MessageConversationType = {
  id: string
  name: string
  avatar: string
  members: string[]
  messages: MessageType[]
}
