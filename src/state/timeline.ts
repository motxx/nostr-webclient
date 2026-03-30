import { atom } from 'jotai'
import { Note } from '@/domain/entities/Note'

export enum SubscriptionStatus {
  Idle = 'idle',
  Subscribing = 'subscribing',
  Error = 'error',
}

export const timelineNotesAtom = atom<Note[]>([])
export const timelineSubscriptionAtom = atom<{
  unsubscribe: () => void
} | null>(null)
export const timelineSubscriptionStatusAtom = atom<SubscriptionStatus>(
  SubscriptionStatus.Idle
)
export const timelineFetchingAtom = atom(false)
export const timelineErrorAtom = atom<Error | null>(null)
