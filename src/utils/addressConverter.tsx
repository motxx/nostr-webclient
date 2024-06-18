import { User } from '@/domain/entities/User'

export const nostrAddressForDisplay = (nostrAddress: string) => {
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
    ? nostrAddressForDisplay(profile.nostrAddress)
    : shortenNpub(user.npub)
}

export const userNameForDisplay = (user: User) => {
  const profile = user.profile
  return profile?.name ? profile.name : shortenNpub(user.npub)
}
