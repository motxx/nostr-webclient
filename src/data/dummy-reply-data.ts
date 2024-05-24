import user1Image from '../assets/images/example/waifu.png'
import user2Image from '../assets/images/example/man.jpg'
import { PostItemType } from '../global/types'

type PostTypeWithId = PostItemType & { id: string }
const replyData: PostTypeWithId[] = [
  {
    id: '101',
    userId: 'riel.pages.dev',
    userName: 'riel@休職中',
    verified: false,
    content: 'うおおおおおお！！！',
    replies: 0,
    likes: 3,
    reposts: 0,
    zaps: 15,
    userImage: user1Image,
    timestamp: '2 hours ago',
    following: true,
  },
  {
    id: '102',
    userId: 'emiliod',
    userName: 'Emilio Drake',
    verified: true,
    content: 'nice!!!',
    replies: 0,
    likes: 0,
    reposts: 0,
    zaps: 0,
    userImage: user2Image,
    timestamp: '1 hours ago',
    following: false,
  },
]

export default replyData
