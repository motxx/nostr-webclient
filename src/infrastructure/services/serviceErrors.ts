import { NDKEvent } from '@nostr-dev-kit/ndk'

const getCircularReplacer = () => {
  const seen = new WeakSet()
  return (_key: string, value: any) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return
      }
      seen.add(value)
    }
    return value
  }
}

export class NoteServiceNotTextEvent extends Error {
  constructor(event: NDKEvent) {
    super(
      `NoteService: Event is not a text event: ${JSON.stringify(event, getCircularReplacer())}`
    )
  }
}
