import { User } from '@/domain/entities/User'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { Dispatch } from 'react'
import { Note } from '@/domain/entities/Note'
import { AppAction } from './actions'

export enum AuthStatus {
  Idle = 'idle',
  Initializing = 'initializing',
  ClientReady = 'client_ready',
  LoggedIn = 'logged_in',
  Error = 'error',
}

export enum TimelineStatus {
  Idle = 'idle',
  Subscribing = 'subscribing',
  Error = 'error',
}

export interface AuthState {
  status: AuthStatus
  loggedInUser: User | null
  readOnlyUser: User | null
  nostrClient: NostrClient | null
  error: Error | null
}

interface TimelineState {
  status: TimelineStatus
  notes: Note[]
  error: Error | null
  timeline: { unsubscribe: () => void } | null
  fetchingPastNotes: boolean // 永続subscribeと独立に動くため、statusと別で管理
}

export interface AppState {
  auth: AuthState
  timeline: TimelineState
  dispatch: Dispatch<AppAction>
}
