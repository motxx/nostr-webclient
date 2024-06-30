import { User } from '@/domain/entities/User'
import { bech32 } from 'bech32'
import { Result } from 'neverthrow'

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

const uint8ArrayToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export const bech32ToHex = (encoded: string): Result<string, Error> => {
  return Result.fromThrowable(
    () => {
      const { prefix, words } = bech32.decode(encoded)
      switch (prefix) {
        case 'npub':
        case 'note':
        case 'nevent':
        case 'event':
          const bytes = bech32.fromWords(words)
          return uint8ArrayToHex(new Uint8Array(bytes))
        case 'nsec':
          throw new Error(
            'nsec1 (secret key) should not be converted to hex publicly'
          )
        default:
          throw new Error(`Unsupported prefix: ${prefix}`)
      }
    },
    (error) => error as Error
  )()
}
