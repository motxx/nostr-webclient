import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import TimelineStandard from './TimelineStandard'
import { createNote, createUser } from '@/test/factories'

// Kent C. Dodds: "Mostly integration."
//
// TimelineStandard renders a list of NoteItems.
// We test that all notes appear — the same thing a user would check.

describe('TimelineStandard', () => {
  it('renders all notes in the list', () => {
    const notes = [
      createNote({
        text: 'First note',
        author: createUser({ profile: { name: 'Alice' } }),
      }),
      createNote({
        text: 'Second note',
        author: createUser({ profile: { name: 'Bob' } }),
      }),
    ]

    renderWithProviders(<TimelineStandard notes={notes} />)

    expect(screen.getByText('First note')).toBeInTheDocument()
    expect(screen.getByText('Second note')).toBeInTheDocument()
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
  })

  it('renders empty when no notes', () => {
    const { container } = renderWithProviders(
      <TimelineStandard notes={[]} />
    )

    // The wrapper div is still rendered, but has no note children
    const noteItems = container.querySelectorAll('.mb-8, .mb-10')
    expect(noteItems).toHaveLength(0)
  })
})
