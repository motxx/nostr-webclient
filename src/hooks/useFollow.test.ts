import { act } from '@testing-library/react'
import { renderHookWithProviders } from '@/test/helpers'
import { useFollow } from './useFollow'

// Kent C. Dodds: "Test the contract, not the implementation."
// We don't test that a specific Jotai atom changed — we test the
// return values of the hook, the same thing a component would see.

describe('useFollow', () => {
  it('starts as not following', () => {
    const { result } = renderHookWithProviders(() =>
      useFollow('pk_alice')
    )

    expect(result.current.isFollowing).toBe(false)
  })

  it('toggles to following when toggleFollow is called', () => {
    const { result } = renderHookWithProviders(() =>
      useFollow('pk_alice')
    )

    act(() => {
      result.current.toggleFollow('Alice')
    })

    expect(result.current.isFollowing).toBe(true)
  })

  it('toggles back to not following on second call', () => {
    const { result } = renderHookWithProviders(() =>
      useFollow('pk_alice')
    )

    act(() => {
      result.current.toggleFollow('Alice')
    })
    act(() => {
      result.current.toggleFollow('Alice')
    })

    expect(result.current.isFollowing).toBe(false)
  })

  it('tracks follow state independently per pubkey', () => {
    const { result: aliceResult } = renderHookWithProviders(() =>
      useFollow('pk_alice')
    )
    const { result: bobResult } = renderHookWithProviders(() =>
      useFollow('pk_bob')
    )

    act(() => {
      aliceResult.current.toggleFollow('Alice')
    })

    expect(aliceResult.current.isFollowing).toBe(true)
    expect(bobResult.current.isFollowing).toBe(false)
  })
})
