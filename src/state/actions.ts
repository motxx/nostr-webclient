import { getDefaultStore } from 'jotai'
import { npubFromNostrAddressFamily, userProfileFamily } from './atoms'
import { UserProfile } from '@/domain/entities/UserProfile'

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
