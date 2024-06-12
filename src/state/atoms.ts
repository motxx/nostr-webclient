import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { User } from '@/domain/entities/User'
import { UserProfile } from '@/domain/entities/UserProfile'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'

export const isLoggedInAtom = atom<boolean>(false)
export const userAtom = atom(
  new User({
    npub: 'npub1v20e8yj9y7n58q5kfp0fahea9g4p3pmv2ufjgc6c9mcnugyeemyqu6s59g',
    pubkey: '629f93924527a7438296485e9edf3d2a2a18876c57132463582ef13e2099cec8',
    profile: new UserProfile({
      name: 'moti',
      image: 'https://randomuser.me/api/portraits/men/5.jpg',
    }),
  })
)

export const publicChannelScrollPositionAtom = atom<{
  [channelId: string]: number
}>({})

export const userProfileFamily = atomFamily((npub: string) =>
  atom<UserProfile | null>(null)
)

export const nostrClientAtom = atom<NostrClient | null>(null)
