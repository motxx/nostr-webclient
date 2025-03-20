import { configureStore } from '@reduxjs/toolkit'
import timelineReducer from '@/components/Timeline/timelineSlice'
import { NoteService } from '@/infrastructure/services/NoteService'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { connectNostrClient } from '@/infrastructure/nostr/nostrClient'

let noteService: NoteService

const nostrClientResult = connectNostrClient()
nostrClientResult.match(
  (nostrClient) => {
    const userProfileService = new UserProfileService(nostrClient)
    noteService = new NoteService(nostrClient, userProfileService)
  },
  (error) => {
    console.error('Failed to connect to Nostr:', error)
    throw error
  }
)

export const store = configureStore({
  reducer: {
    timeline: timelineReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { noteRepository: noteService! },
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
