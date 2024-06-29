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
    json: '{}',
    replyChildNotes: [],
    reactions: {
      likesCount: 0,
      repostsCount: 0,
      zapsAmount: 0,
      customReactions: {},
    },
    following: true,
  }
}
