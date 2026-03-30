import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import NoteItem from './NoteItem'
import { createNote, createUser } from '@/test/factories'

// Kent C. Dodds: "Write tests. Not too many. Mostly integration."
//
// NoteItem is the central component of the timeline. We test it as
// a user sees it: author name, text content, reply targets.

describe('NoteItem', () => {
  it('renders note text and author name', () => {
    const note = createNote({
      text: 'Hello from Nostr!',
      author: createUser({ profile: { name: 'Satoshi' } }),
    })

    renderWithProviders(<NoteItem note={note} />)

    expect(screen.getByText('Hello from Nostr!')).toBeInTheDocument()
    expect(screen.getByText('Satoshi')).toBeInTheDocument()
  })

  it('hides action buttons for nested reply notes', () => {
    const note = createNote({ text: 'Reply content' })

    const { container } = renderWithProviders(
      <NoteItem note={note} noteDepth={1} />
    )

    // At depth > 0, NoteItemActions is not rendered
    expect(screen.getByText('Reply content')).toBeInTheDocument()
    // The action row (with reply/repost/like/zap) should not be present
    expect(container.querySelector('.flex.items-center.space-x-1')).toBeNull()
  })

  it('renders reply target notes when present', () => {
    const replyTarget = createNote({ text: 'Original post' })
    const note = createNote({
      text: 'My reply',
      replyTargetNotes: [replyTarget],
    })

    renderWithProviders(<NoteItem note={note} />)

    expect(screen.getByText('Original post')).toBeInTheDocument()
    expect(screen.getByText('My reply')).toBeInTheDocument()
  })
})
