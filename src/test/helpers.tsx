import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider, createStore, WritableAtom } from 'jotai'
import { MemoryRouter } from 'react-router-dom'
import { renderHook } from '@testing-library/react-hooks'

type AtomInitializer = readonly [WritableAtom<any, [any], void>, any]

interface WrapperOptions {
  initialAtomValues?: AtomInitializer[]
  initialRoute?: string
}

/**
 * Creates a Jotai store pre-loaded with the given atom values.
 *
 * Kent C. Dodds says: "The more your tests resemble the way your software
 * is used, the more confidence they can give you."
 *
 * By injecting values at the atom level (not mocking hooks or modules),
 * we let the real React component tree run — only the external data changes.
 */
export function createTestStore(initialValues: AtomInitializer[] = []) {
  const store = createStore()
  initialValues.forEach(([atom, value]) => store.set(atom, value))
  return store
}

function createWrapper({
  initialAtomValues = [],
  initialRoute = '/',
}: WrapperOptions = {}) {
  const store = createTestStore(initialAtomValues)

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialRoute]}>{children}</MemoryRouter>
    </Provider>
  )

  return { Wrapper, store }
}

/**
 * Custom render — wraps the component with Jotai Provider + MemoryRouter.
 *
 * Usage:
 *   const { user } = renderWithProviders(<MyComponent />, {
 *     initialAtomValues: [[authStatusAtom, AuthStatus.LoggedIn]],
 *   })
 *   await user.click(screen.getByRole('button', { name: /submit/i }))
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialAtomValues = [],
    initialRoute = '/',
    ...renderOptions
  }: WrapperOptions & Omit<RenderOptions, 'wrapper'> = {}
) {
  const { Wrapper, store } = createWrapper({ initialAtomValues, initialRoute })
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    store,
  }
}

/**
 * Custom renderHook — same idea, for testing hooks in isolation.
 *
 * Usage:
 *   const { result } = renderHookWithProviders(() => useFollow('pubkey123'))
 *   act(() => { result.current.toggleFollow('Alice') })
 *   expect(result.current.isFollowing).toBe(true)
 */
export function renderHookWithProviders<T>(
  hook: () => T,
  {
    initialAtomValues = [],
    initialRoute = '/',
  }: WrapperOptions = {}
) {
  const { Wrapper, store } = createWrapper({ initialAtomValues, initialRoute })
  return {
    ...renderHook(hook, { wrapper: Wrapper }),
    store,
  }
}
