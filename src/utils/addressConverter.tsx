import { User } from '@/domain/entities/User'
import { bech32 } from 'bech32'

export const nostrAddressSimplified = (nostrAddress: string) => {
  return nostrAddress.startsWith('_@')
    ? nostrAddress.substring(1)
    : nostrAddress
}

const shortenNpub = (npub: string) => {
  return npub.substring(0, 8) + '...' + npub.substring(npub.length - 4)
}

export const userIdForDisplay = (user: User) => {
  const profile = user.profile
  return profile?.nostrAddress
    ? nostrAddressSimplified(profile.nostrAddress)
    : shortenNpub(user.npub)
}

export const userNameForDisplay = (user: User) => {
  const profile = user.profile
  return profile?.name ? profile.name : shortenNpub(user.npub)
}

export const npubToPubkey = (npub: string) => {
  if (!npub.startsWith('npub1')) {
    throw new Error('Invalid npub format')
  }
  const pubkeyArray = bech32.fromWords(bech32.decode(npub).words)
  const pubkeyHex = Array.from(pubkeyArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
  return pubkeyHex
}
