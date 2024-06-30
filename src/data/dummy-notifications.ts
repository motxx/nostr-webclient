import { NotificationNoteType } from '@/domain/entities/Note'

const notifications: NotificationNoteType[] = [
  // Likes - Single User
  {
    id: '1',
    author: {
      npub: 'npub1xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey1',
      profile: {
        name: 'User One',
        image: 'https://randomuser.me/api/portraits/men/1.jpg',
      },
    },
    text: 'User One liked your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T14:00:00Z'),
    type: 'like',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
  // Likes - Multiple Users
  {
    id: '5',
    author: {
      npub: 'npub2xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey2',
      profile: {
        name: 'User Two',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
    },
    text: 'Multiple users liked your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T15:00:00Z'),
    type: 'like',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
  {
    id: '6',
    author: {
      npub: 'npub3xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey3',
      profile: {
        name: 'User Three',
        image: 'https://randomuser.me/api/portraits/men/3.jpg',
      },
    },
    text: 'Multiple users liked your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T15:30:00Z'),
    type: 'like',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
  // Replies - Single User
  {
    id: '2',
    author: {
      npub: 'npub2xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey2',
      profile: {
        name: 'User Two',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
      },
    },
    text: 'User Two replied to your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T13:00:00Z'),
    type: 'reply',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
  // Replies - Multiple Users
  {
    id: '7',
    author: {
      npub: 'npub4xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey4',
      profile: {
        name: 'User Four',
        image: 'https://randomuser.me/api/portraits/men/4.jpg',
      },
    },
    text: 'User Four replied to your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T14:00:00Z'),
    type: 'reply',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
  {
    id: '8',
    author: {
      npub: 'npub5xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey5',
      profile: {
        name: 'User Five',
        image: 'https://randomuser.me/api/portraits/men/5.jpg',
      },
    },
    text: 'User Five replied to your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T15:00:00Z'),
    type: 'reply',
    replies: 0,
    following: false,
  },
  // Zaps - Single User
  {
    id: '4',
    author: {
      npub: 'npub4xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey4',
      profile: {
        name: 'User Four',
        image: 'https://randomuser.me/api/portraits/men/4.jpg',
      },
    },
    text: 'User Four zapped your post with 100 sats.',
    media: [],
    json: '',
    created_at: new Date('2024-06-14T12:00:00Z'),
    type: 'zap',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
  // Zaps - Multiple Users
  {
    id: '9',
    author: {
      npub: 'npub6xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey6',
      profile: {
        name: 'User Six',
        image: 'https://randomuser.me/api/portraits/men/6.jpg',
      },
    },
    text: 'Multiple users zapped your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T15:40:00Z'),
    type: 'zap',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
  {
    id: '10',
    author: {
      npub: 'npub7xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey7',
      profile: {
        name: 'User Seven',
        image: 'https://randomuser.me/api/portraits/men/7.jpg',
      },
    },
    text: 'Multiple users zapped your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T15:50:00Z'),
    type: 'zap',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
  // Reposts
  {
    id: '3',
    author: {
      npub: 'npub8xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey8',
      profile: {
        name: 'User Eight',
        image: 'https://randomuser.me/api/portraits/men/8.jpg',
      },
    },
    text: 'User Eight reposted your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T10:00:00Z'),
    type: 'repost',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
  // Reposts - Multiple Users
  {
    id: '11',
    author: {
      npub: 'npub8xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey8',
      profile: {
        name: 'User Eight',
        image: 'https://randomuser.me/api/portraits/men/8.jpg',
      },
    },
    text: 'Multiple users reposted your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T11:00:00Z'),
    type: 'repost',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
  {
    id: '12',
    author: {
      npub: 'npub9xxxxxxxxxxxxxxxxxx',
      pubkey: 'pubkey9',
      profile: {
        name: 'User Nine',
        image: 'https://randomuser.me/api/portraits/men/9.jpg',
      },
    },
    text: 'Multiple users reposted your post.',
    media: [],
    json: '',
    created_at: new Date('2024-06-15T11:30:00Z'),
    type: 'repost',
    reactions: {
      likesCount: 1,
      zapsAmount: 0,
      repostsCount: 0,
      customReactions: {},
    },
    replyTargetNotes: [],
    following: false,
  },
]

export default notifications
