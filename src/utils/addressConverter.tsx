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

const shortenNostrAddress = (nostrAddress: string) => {
  const atIndex = nostrAddress.indexOf('@')
  if (atIndex === -1) return nostrAddress

  const name = nostrAddress.substring(0, atIndex)
  const domain = nostrAddress.substring(atIndex + 1)

  const shortenedName = name.length > 24 ? name.substring(0, 24) + '...' : name
  const shortenedDomain =
    domain.length > 24 ? domain.substring(0, 24) + '...' : domain

  return `${shortenedName}@${shortenedDomain}`
}

export const userIdForDisplay = (user: User) => {
  const profile = user.profile
  return profile?.nostrAddress
    ? shortenNostrAddress(nostrAddressSimplified(profile.nostrAddress))
    : shortenNpub(user.npub)
}

export const userNameForDisplay = (user: User) => {
  const profile = user.profile
  return profile?.name ? profile.name : shortenNpub(user.npub)
}

export const uint8ArrayToHex = (bytes: Uint8Array): string => {
  return Buffer.from(bytes).toString('hex')
}

export const hexToUint8Array = (hex: string): Uint8Array => {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)))
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

// XXX: Not verified yet.
export const hexToBech32 = (
  hex: string,
  prefix: string = 'npub'
): Result<string, Error> => {
  return Result.fromThrowable(
    () => {
      const bytes = new Uint8Array(
        hex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
      )
      const words = bech32.toWords(bytes)
      return bech32.encode(prefix, words, 1000)
    },
    (error) => error as Error
  )()
}
