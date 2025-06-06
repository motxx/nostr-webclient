import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { User } from '@/domain/entities/User'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'

export enum AuthStatus {
  Idle = 'idle',
  Initializing = 'initializing',
  ClientReady = 'client_ready',
  LoggedIn = 'logged_in',
  Error = 'error',
}

interface AuthState {
  status: AuthStatus
  loggedInUser: User | null
  readOnlyUser: User | null
  nostrClient: NostrClient | null
  error: Error | null
}

const initialState: AuthState = {
  status: AuthStatus.Idle,
  loggedInUser: null,
  readOnlyUser: null,
  nostrClient: null,
  error: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    initializeStart: (state) => {
      state.status = AuthStatus.Initializing
      state.error = null
    },
    initializeSuccess: (state, action: PayloadAction<{ nostrClient: NostrClient; readOnlyUser?: User }>) => {
      state.status = AuthStatus.ClientReady
      state.nostrClient = action.payload.nostrClient
      state.readOnlyUser = action.payload.readOnlyUser || null
      state.error = null
    },
    initializeFailure: (state, action: PayloadAction<Error>) => {
      state.status = AuthStatus.Error
      state.error = action.payload
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.status = AuthStatus.LoggedIn
      state.loggedInUser = action.payload
      state.error = null
    },
    loginFailure: (state, action: PayloadAction<Error>) => {
      state.status = AuthStatus.Error
      state.error = action.payload
    },
    logout: (state) => {
      state.status = AuthStatus.ClientReady
      state.loggedInUser = null
      state.error = null
    },
  },
})

export const {
  initializeStart,
  initializeSuccess,
  initializeFailure,
  loginSuccess,
  loginFailure,
  logout,
} = authSlice.actions

export default authSlice.reducer