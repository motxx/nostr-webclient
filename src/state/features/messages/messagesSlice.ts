import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Conversation } from '@/domain/entities/Conversation'
import { DirectMessage } from '@/domain/entities/DirectMessage'

export enum MessagesStatus {
  Idle = 'idle',
  Subscribing = 'subscribing',
  Error = 'error',
}

interface MessagesState {
  status: MessagesStatus
  conversations: Conversation[]
  temporaryMessages: DirectMessage[]
  error: Error | null
}

const initialState: MessagesState = {
  status: MessagesStatus.Idle,
  conversations: [],
  temporaryMessages: [],
  error: null,
}

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    subscribeMessages: (state) => {
      state.status = MessagesStatus.Subscribing
      state.error = null
    },
    subscribeMessagesError: (state, action: PayloadAction<Error>) => {
      state.status = MessagesStatus.Error
      state.error = action.payload
    },
    addNewMessage: (state, action: PayloadAction<Conversation>) => {
      const existingIndex = state.conversations.findIndex(
        (conv) => conv.id === action.payload.id
      )
      if (existingIndex !== -1) {
        state.conversations[existingIndex] = action.payload
      } else {
        state.conversations.push(action.payload)
      }
    },
    sendMessage: (state, action: PayloadAction<DirectMessage>) => {
      state.temporaryMessages.push(action.payload)
    },
    sendMessageError: (state, action: PayloadAction<Error>) => {
      state.error = action.payload
    },
    createNewConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.push(action.payload)
    },
    createNewConversationError: (state, action: PayloadAction<Error>) => {
      state.error = action.payload
    },
    unsubscribeMessages: (state) => {
      state.status = MessagesStatus.Idle
      state.conversations = []
      state.temporaryMessages = []
      state.error = null
    },
  },
})

export const {
  subscribeMessages,
  subscribeMessagesError,
  addNewMessage,
  sendMessage,
  sendMessageError,
  createNewConversation,
  createNewConversationError,
  unsubscribeMessages,
} = messagesSlice.actions

export default messagesSlice.reducer