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

export enum SubscriptionStatus {
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

interface SubscriptionState {
  status: SubscriptionStatus
  notes: Note[]
  error: Error | null
  subscription: { unsubscribe: () => void } | null
  fetchingPastNotes: boolean // 永続subscribeと独立に動くため、statusと別で管理
}

export interface AppState {
  auth: AuthState
  subscription: SubscriptionState
  dispatch: Dispatch<AppAction>
}
