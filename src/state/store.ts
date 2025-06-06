import { configureStore } from '@reduxjs/toolkit'
import timelineReducer from '@/state/features/timeline/timelineSlice'
import authReducer from '@/state/features/auth/authSlice'
import messagesReducer from '@/state/features/messages/messagesSlice'
import notificationsReducer from '@/state/features/notifications/notificationsSlice'
import publicChatReducer from '@/state/features/publicChat/publicChatSlice'
import { NoteService } from '@/infrastructure/services/NoteService'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { NotificationService } from '@/infrastructure/services/NotificationService'
import { connectNostrClient } from '@/infrastructure/nostr/nostrClient'

let noteService: NoteService
let directMessageService: DirectMessageService
let notificationService: NotificationService

const nostrClientResult = connectNostrClient()
nostrClientResult.match(
  (nostrClient) => {
    const userProfileService = new UserProfileService(nostrClient)
    noteService = new NoteService(nostrClient, userProfileService)
    directMessageService = new DirectMessageService(nostrClient)
    notificationService = new NotificationService(nostrClient, userProfileService, noteService)
  },
  (error) => {
    console.error('Failed to connect to Nostr:', error)
    throw error
  }
)

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timeline: timelineReducer,
    messages: messagesReducer,
    notifications: notificationsReducer,
    publicChat: publicChatReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { 
          noteRepository: noteService!,
          directMessageService: directMessageService!,
          notificationService: notificationService!,
        },
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
