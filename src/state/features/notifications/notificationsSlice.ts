import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Notification } from '@/domain/entities/Notification'

export enum NotificationsStatus {
  Idle = 'idle',
  Subscribing = 'subscribing',
  Error = 'error',
}

interface NotificationsState {
  status: NotificationsStatus
  notifications: Notification[]
  fetchingPastNotifications: boolean
  error: Error | null
}

const initialState: NotificationsState = {
  status: NotificationsStatus.Idle,
  notifications: [],
  fetchingPastNotifications: false,
  error: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    subscribeNotifications: (state) => {
      state.status = NotificationsStatus.Subscribing
      state.error = null
    },
    subscribeNotificationsError: (state, action: PayloadAction<Error>) => {
      state.status = NotificationsStatus.Error
      state.error = action.payload
    },
    unsubscribeNotifications: (state) => {
      state.status = NotificationsStatus.Idle
      state.notifications = []
      state.error = null
    },
    fetchPastNotificationsStart: (state) => {
      state.fetchingPastNotifications = true
    },
    fetchPastNotificationsEnd: (state, action: PayloadAction<Notification[]>) => {
      state.fetchingPastNotifications = false
      state.notifications = [...state.notifications, ...action.payload]
    },
    fetchPastNotificationsError: (state, action: PayloadAction<Error>) => {
      state.fetchingPastNotifications = false
      state.error = action.payload
    },
    addNewNotification: (state, action: PayloadAction<Notification>) => {
      const exists = state.notifications.some((n) => n.id === action.payload.id)
      if (!exists) {
        state.notifications.unshift(action.payload)
      }
    },
  },
})

export const {
  subscribeNotifications,
  subscribeNotificationsError,
  unsubscribeNotifications,
  fetchPastNotificationsStart,
  fetchPastNotificationsEnd,
  fetchPastNotificationsError,
  addNewNotification,
} = notificationsSlice.actions

export default notificationsSlice.reducer