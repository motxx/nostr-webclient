/**
 * Test data factories.
 *
 * Kent C. Dodds's approach: keep factory helpers minimal — just enough
 * to get a valid object. Override only the fields the test cares about.
 * If a test does NOT specify a field, the default should be invisible.
 */

import { NoteType } from '@/domain/entities/Note'
import { User } from '@/domain/entities/User'
import { Notification } from '@/domain/entities/Notification'

let counter = 0
const nextId = () => `test-${++counter}`

export function createUser(overrides: Partial<User> = {}): User {
  const id = nextId()
  return {
    npub: `npub1${id}`,
    pubkey: `pk_${id}`,
    profile: {
      name: `User ${id}`,
      image: `https://example.com/${id}.jpg`,
      nostrAddress: `${id}@example.com`,
    },
    ...overrides,
  }
}

export function createNote(overrides: Partial<NoteType> = {}): NoteType {
  const id = nextId()
  return {
    id: `note_${id}`,
    author: createUser(),
    text: `Test note content ${id}`,
    json: '{}',
    created_at: new Date('2024-06-01T12:00:00Z'),
    reactions: {
      likesCount: 0,
      repostsCount: 0,
      zapsAmount: 0,
      customReactions: {},
    },
    relays: [],
    ...overrides,
  }
}

export function createNotification(
  overrides: Partial<ConstructorParameters<typeof Notification>[0]> = {}
): Notification {
  return new Notification({
    id: nextId(),
    type: 'like',
    actor: createUser(),
    target: createNote(),
    createdAt: new Date('2024-06-01T12:00:00Z'),
    ...overrides,
  })
}
