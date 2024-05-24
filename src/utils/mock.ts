import { PostItemType } from '../global/types'
import meImage from '../assets/images/example/me.png'

export const createDummyNewReply = (
  text: string
): PostItemType & { id: string } => {
  return {
    id: '109',
    userName: 'moti',
    content: text,
    userImage: meImage,
    timestamp: 'just now',
    userId: 'riel.pages.dev',
    verified: false,
    replies: 0,
    likes: 0,
    reposts: 0,
    zaps: 0,
    following: true,
  }
}
