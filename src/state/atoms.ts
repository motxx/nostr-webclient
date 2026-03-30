import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { UserProfile } from '@/domain/entities/UserProfile'
import { PublicChatMessage } from '@/domain/entities/PublicChat'

export const publicChatScrollPositionAtom = atom<{
  [channelId: string]: number
}>({})

export const userProfileFamily = atomFamily((npub: string) =>
  atom<UserProfile | null>(null)
)

export const npubFromNostrAddressFamily = atomFamily((nostrAddress: string) =>
  atom<string | null>(null)
)

export const publicChatMessagesFamily = atomFamily((channelId: string) =>
  atom<PublicChatMessage[]>([])
)
