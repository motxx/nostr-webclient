import { PostItemType } from '../global/types'

export const createDummyNewReply = (
  text: string
): PostItemType & { id: string } => {
  return {
    id: '109',
    userName: 'moti',
    content: text,
    userImage: 'https://randomuser.me/api/portraits/men/5.jpg',
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
