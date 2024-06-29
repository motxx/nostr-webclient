import { NoteType } from '@/domain/entities/Note'

export const createDummyNewReply = (text: string): NoteType => {
  return {
    id: '109',
    text,
    author: {
      npub: 'npubexample',
      pubkey: 'pubkeyexample',
      profile: {
        name: 'moti',
        nostrAddress: '_@motxx.pages.dev',
        image: 'https://randomuser.me/api/portraits/men/5.jpg',
      },
    },
    created_at: new Date(),
    replyChildNotes: [],
    likes: 0,
    reposts: 0,
    zaps: 0,
    following: true,
  }
}
