import React from 'react'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '@/test/helpers'
import LoginPrompt from './LoginPrompt'
import { authStatusAtom, AuthStatus } from '@/state/auth'

// Kent C. Dodds: "Your tests should give you confidence that
// your app works correctly."
//
// These tests verify the behaviour a real user would observe:
// - When not logged in → login prompt is visible
// - When logged in → login prompt disappears

describe('LoginPrompt', () => {
  it('renders login prompt when status is Idle', () => {
    renderWithProviders(<LoginPrompt />, {
      initialAtomValues: [[authStatusAtom, AuthStatus.Idle]],
    })

    expect(
      screen.getByText('ログインしてNostrを始めよう')
    ).toBeInTheDocument()
    expect(screen.getByText('ログイン')).toBeInTheDocument()
  })

  it('renders login prompt when status is ClientReady', () => {
    renderWithProviders(<LoginPrompt />, {
      initialAtomValues: [[authStatusAtom, AuthStatus.ClientReady]],
    })

    expect(
      screen.getByText('ログインしてNostrを始めよう')
    ).toBeInTheDocument()
  })

  it('renders nothing when status is LoggedIn', () => {
    const { container } = renderWithProviders(<LoginPrompt />, {
      initialAtomValues: [[authStatusAtom, AuthStatus.LoggedIn]],
    })

    expect(container).toBeEmptyDOMElement()
  })
})
