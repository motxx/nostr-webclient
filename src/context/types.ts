import { User } from '@/domain/entities/User'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { Dispatch } from 'react'
import { Note } from '@/domain/entities/Note'
import { AppAction } from './actions'
import { Conversation } from '@/domain/entities/Conversation'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { Notification } from '@/domain/entities/Notification'
import { Subscription } from 'rxjs'

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

export enum NotificationsStatus {
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
  subscription: Subscription | null
  notes: Note[]
  error: Error | null
  fetchingPastNotes: boolean // 永続subscribeと独立に動くため、statusと別で管理
}

export interface MessagesState {
  status: MessagesStatus
  subscription: Subscription | null
  conversations: Conversation[]
  temporaryMessages: DirectMessage[] // 送信中のメッセージを一時的に保存
  error: Error | null
}

export interface NotificationsState {
  status: NotificationsStatus
  subscription: Subscription | null
  notifications: Notification[]
  fetchingPastNotifications: boolean
  error: Error | null
}

export interface AppState {
  auth: AuthState
  timeline: TimelineState
  messages: MessagesState
  notifications: NotificationsState
  dispatch: Dispatch<AppAction>
}
