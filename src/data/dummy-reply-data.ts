import user1Image from '../assets/images/example/waifu.png'
import user2Image from '../assets/images/example/man.jpg'
import { NoteType } from '@/domain/entities/Note'

const replyData: NoteType[] = [
  {
    id: '101',
    author: {
      npub: 'npub1v20e8yj9y7n58q5kfp0fahea9g4p3pmv2ufjgc6c9mcnugyeemyqu6s59g',
      pubkey:
        '629f93924527a7438296485e9edf3d2a2a18876c57132463582ef13e2099cec8',
      profile: {
        name: 'moti',
        nostrAddress: '_@motxx.pages.dev',
        image: user1Image,
      },
    },
    text: 'うおおおおおお！！！',
    replies: 0,
    likes: 3,
    reposts: 0,
    zaps: 15,
    created_at: new Date('2024-06-01T00:00:00Z'),
    following: true,
  },
  {
    id: '102',
    author: {
      npub: 'npub1v20e8yj9y7n58q5kfp0fahea9g4p3pmv2ufjgc6c9mcnugyeemyqu6s59g',
      pubkey:
        '629f93924527a7438296485e9edf3d2a2a18876c57132463582ef13e2099cec8',
      profile: {
        name: 'Elimio Drake',
        nostrAddress: 'emilio@nostr.example',
        image: user2Image,
      },
    },
    text: 'nice!!!',
    replies: 0,
    likes: 0,
    reposts: 0,
    zaps: 0,
    created_at: new Date('2024-06-02T00:00:00Z'),
    following: false,
  },
]

export default replyData
