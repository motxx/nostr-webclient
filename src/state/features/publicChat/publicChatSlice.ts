import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { PublicChatMessage } from '@/domain/entities/PublicChat'

interface PublicChatState {
  messages: { [channelId: string]: PublicChatMessage[] }
  scrollPositions: { [channelId: string]: number }
}

const initialState: PublicChatState = {
  messages: {},
  scrollPositions: {},
}

const publicChatSlice = createSlice({
  name: 'publicChat',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<{ channelId: string; messages: PublicChatMessage[] }>) => {
      state.messages[action.payload.channelId] = action.payload.messages
    },
    addMessage: (state, action: PayloadAction<{ channelId: string; message: PublicChatMessage }>) => {
      if (!state.messages[action.payload.channelId]) {
        state.messages[action.payload.channelId] = []
      }
      state.messages[action.payload.channelId].push(action.payload.message)
    },
    setScrollPosition: (state, action: PayloadAction<{ channelId: string; position: number }>) => {
      state.scrollPositions[action.payload.channelId] = action.payload.position
    },
    clearChannel: (state, action: PayloadAction<string>) => {
      delete state.messages[action.payload]
      delete state.scrollPositions[action.payload]
    },
  },
})

export const {
  setMessages,
  addMessage,
  setScrollPosition,
  clearChannel,
} = publicChatSlice.actions

export default publicChatSlice.reducer