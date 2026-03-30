import { atom } from 'jotai'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { User } from '@/domain/entities/User'

export enum AuthStatus {
  Idle = 'idle',
  Initializing = 'initializing',
  ClientReady = 'client_ready',
  LoggedIn = 'logged_in',
  Error = 'error',
}

export const authStatusAtom = atom<AuthStatus>(AuthStatus.Idle)
export const nostrClientAtom = atom<NostrClient | null>(null)
export const loggedInUserAtom = atom<User | null>(null)
export const readOnlyUserAtom = atom<User | null>(null)
export const authErrorAtom = atom<Error | null>(null)
