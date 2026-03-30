import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/helpers'
import FollowButton from './FollowButton'

// Kent C. Dodds: "Avoid testing implementation details."
//
// FollowButton internally uses useFollow(pubkey), but the test
// doesn't know or care about that. We click the button and check
// that the visible text changes.

describe('FollowButton', () => {
  it('shows "フォロー" when not following', () => {
    renderWithProviders(
      <FollowButton pubkey="pk_alice" userId="alice@example.com" />
    )

    expect(screen.getByText('フォロー')).toBeInTheDocument()
  })

  it('shows "フォロー中" after clicking', async () => {
    const user = userEvent

    renderWithProviders(
      <FollowButton pubkey="pk_alice" userId="alice@example.com" />
    )

    await user.click(screen.getByText('フォロー'))

    expect(screen.getByText('フォロー中')).toBeInTheDocument()
  })

  it('toggles back to "フォロー" on second click', async () => {
    const user = userEvent

    renderWithProviders(
      <FollowButton pubkey="pk_alice" userId="alice@example.com" />
    )

    await user.click(screen.getByText('フォロー'))
    await user.click(screen.getByText('フォロー中'))

    expect(screen.getByText('フォロー')).toBeInTheDocument()
  })
})
