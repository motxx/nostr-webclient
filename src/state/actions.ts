import { atom, getDefaultStore } from 'jotai'
import {
  isLoggedInAtom,
  npubFromNostrAddressFamily,
  loggedInUserAtom,
  userProfileFamily,
} from './atoms'
import { User } from '@/domain/entities/User'
import { UserProfile } from '@/domain/entities/UserProfile'

export const loginAction = atom(null, (get, set, user: User) => {
  set(loggedInUserAtom, user)
  set(isLoggedInAtom, true)
})

export const logoutAction = atom(null, (get, set) => {
  set(loggedInUserAtom, null)
  set(isLoggedInAtom, false)
})

const store = getDefaultStore()

export const getUserProfileCache = (npub: string): UserProfile | null => {
  const atom = userProfileFamily(npub)
  return store.get(atom)
}

export const setUserProfileCache = (
  npub: string,
  profile: UserProfile
): void => {
  const atom = userProfileFamily(npub)
  store.set(atom, profile)
}

export const getNpubFromNostrAddressCache = (
  nostrAddress: string
): string | null => {
  const atom = npubFromNostrAddressFamily(nostrAddress)
  return store.get(atom)
}

export const setNpubFromNostrAddressCache = (
  nostrAddress: string,
  npub: string
): void => {
  const atom = npubFromNostrAddressFamily(nostrAddress)
  store.set(atom, npub)
}
