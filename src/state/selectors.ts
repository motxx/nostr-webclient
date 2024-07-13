import { atom } from 'jotai'
import { isLoggedInAtom, loggedInUserAtom } from './atoms'

export const loggedInUserSelector = atom((get) => {
  const isLoggedIn = get(isLoggedInAtom)
  const user = get(loggedInUserAtom)

  return isLoggedIn ? user : null
})
