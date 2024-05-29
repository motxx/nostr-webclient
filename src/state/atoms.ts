import { atom } from 'jotai'
import { LoginStatus } from '../global/types'
import { User } from '../models/user'

export const isLoggedInAtom = atom<LoginStatus>(false)
export const userAtom = atom(
  new User({
    npub: 'npub1v20e8yj9y7n58q5kfp0fahea9g4p3pmv2ufjgc6c9mcnugyeemyqu6s59g',
    pubkey: '629f93924527a7438296485e9edf3d2a2a18876c57132463582ef13e2099cec8',
    name: 'moti',
    image: '../../assets/images/example/me.png',
  })
)

export const publicChannelScrollPositionAtom = atom<{
  [channelId: string]: number
}>({})
