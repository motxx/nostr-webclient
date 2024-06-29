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
    reactions: {
      likesCount: 3,
      repostsCount: 0,
      zapsAmount: 15,
      customReactions: {},
    },

    created_at: new Date('2024-06-01T00:00:00Z'),
    following: true,
    json: '{}',
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
    reactions: {
      likesCount: 0,
      repostsCount: 0,
      zapsAmount: 0,
      customReactions: {},
    },
    created_at: new Date('2024-06-02T00:00:00Z'),
    following: false,
    json: '{}',
  },
]

export default replyData
