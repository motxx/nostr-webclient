import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers'
import NoteItemMenu from './NoteItemMenu'
import { followStatusFamily } from '@/state/follow'

// Kent C. Dodds: "The more your tests resemble the way your software
// is used, the more confidence they can give you."
//
// We render the real component, click buttons, and assert on visible text.
// The Jotai atom, useFollow hook, and toast are implementation details —
// the test doesn't know or care about them.

describe('NoteItemMenu', () => {
  const defaultProps = {
    userName: 'Alice',
    pubkey: 'pk_noteitem_menu_test',
    onClose: jest.fn(),
    onShowJSON: jest.fn(),
  }

  it('renders follow option when not following', () => {
    renderWithProviders(<NoteItemMenu {...defaultProps} />)

    expect(screen.getByText('Aliceさんをフォロー')).toBeInTheDocument()
  })

  it('calls onClose after clicking follow', async () => {
    const onClose = jest.fn()

    renderWithProviders(
      <NoteItemMenu {...defaultProps} onClose={onClose} />
    )

    await userEvent.click(screen.getByText('Aliceさんをフォロー'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows unfollow text when already following', () => {
    // Pre-set the follow state via atom initializer
    renderWithProviders(<NoteItemMenu {...defaultProps} />, {
      initialAtomValues: [
        [followStatusFamily(defaultProps.pubkey), true],
      ],
    })

    expect(
      screen.getByText('Aliceさんのフォローを解除')
    ).toBeInTheDocument()
  })

  it('shows mute option', () => {
    renderWithProviders(<NoteItemMenu {...defaultProps} />)

    expect(screen.getByText('Aliceさんをミュート')).toBeInTheDocument()
  })

  it('calls onShowJSON and onClose when JSON option is clicked', async () => {
    const onClose = jest.fn()
    const onShowJSON = jest.fn()

    renderWithProviders(
      <NoteItemMenu
        {...defaultProps}
        onClose={onClose}
        onShowJSON={onShowJSON}
      />
    )

    await userEvent.click(screen.getByText('ノートのJSONを表示'))

    expect(onShowJSON).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
