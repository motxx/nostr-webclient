import { atom, getDefaultStore } from 'jotai'
import { isLoggedInAtom, userAtom, userProfileFamily } from './atoms'
import { User } from '@/domain/entities/User'
import { UserProfile } from '@/domain/entities/UserProfile'

export const loginAction = atom(null, (get, set, user: User) => {
  set(userAtom, user)
  set(isLoggedInAtom, true)
})

export const logoutAction = atom(null, (get, set) => {
  set(
    userAtom,
    new User({
      npub: 'npub1v20e8yj9y7n58q5kfp0fahea9g4p3pmv2ufjgc6c9mcnugyeemyqu6s59g',
      pubkey:
        '629f93924527a7438296485e9edf3d2a2a18876c57132463582ef13e2099cec8',
      profile: new UserProfile({
        name: 'moti',
        image: 'https://randomuser.me/api/portraits/men/5.jpg',
      }),
    })
  )
  set(isLoggedInAtom, false)
})

const store = getDefaultStore()

export const getUserProfile = (npub: string): UserProfile | null => {
  const atom = userProfileFamily(npub)
  return store.get(atom)
}

export const setUserProfile = (npub: string, profile: UserProfile): void => {
  const atom = userProfileFamily(npub)
  store.set(atom, profile)
}
