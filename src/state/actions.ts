import { atom } from 'jotai'
import { isLoggedInAtom, userAtom } from './atoms'
import { User } from '../models/user'

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
      name: 'moti',
      image: '../../assets/images/example/me.png',
    })
  )
  set(isLoggedInAtom, false)
})
