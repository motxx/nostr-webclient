import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { User } from '@/domain/entities/User'
import { UserProfile } from '@/domain/entities/UserProfile'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'

export const isLoggedInAtom = atom<boolean>(false)
export const loggedInUserAtom = atom<User | null>(null)

export const publicChannelScrollPositionAtom = atom<{
  [channelId: string]: number
}>({})

export const userProfileFamily = atomFamily((npub: string) =>
  atom<UserProfile | null>(null)
)

export const npubFromNostrAddressFamily = atomFamily((nostrAddress: string) =>
  atom<string | null>(null)
)

export const nostrClientAtom = atom<NostrClient | null>(null)
