import { User } from '@/domain/entities/User'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { Dispatch } from 'react'
import { Note } from '@/domain/entities/Note'
import { AppAction } from './actions'
import { Conversation } from '@/domain/entities/Conversation'
import { DirectMessage } from '@/domain/entities/DirectMessage'

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

export enum MessagesStatus {
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

export interface TimelineState {
  status: TimelineStatus
  notes: Note[]
  error: Error | null
  subscription: { unsubscribe: () => void } | null
  fetchingPastNotes: boolean // 永続subscribeと独立に動くため、statusと別で管理
}

export interface MessagesState {
  status: MessagesStatus
  conversations: Conversation[]
  temporaryMessages: DirectMessage[] // 送信中のメッセージを一時的に保存
  subscription: { unsubscribe: () => void } | null
  error: Error | null
}

export interface AppState {
  auth: AuthState
  timeline: TimelineState
  messages: MessagesState
  dispatch: Dispatch<AppAction>
}
