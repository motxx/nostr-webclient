import { NostrEvent } from '@nostr-dev-kit/ndk'
import { createHash } from 'sha256-uint8array'

export const unixtime = () => {
  return Math.floor(new Date().getTime() / 1000)
}

export const unixtimeOf = (date: Date) => {
  return Math.floor(date.getTime() / 1000)
}

export const yesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday
}

/**
 * Generate event id from unsigned event according to NIP-01
 * @param event NostrEvent
 * @returns string
 */
export const generateEventId = (event: NostrEvent) => {
  // https://github.com/nostr-protocol/nips/blob/master/01.md#events-and-signatures
  const { kind, pubkey, created_at, tags, content } = event
  const message = JSON.stringify([0, pubkey, created_at, kind, tags, content])
  return createHash().update(message).digest('hex')
}
