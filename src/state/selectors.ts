import { atom } from 'jotai'
import { isLoggedInAtom, userAtom } from './atoms'

export const userProfileSelector = atom((get) => {
  const isLoggedIn = get(isLoggedInAtom)
  const user = get(userAtom)

  return isLoggedIn ? user : null
})
