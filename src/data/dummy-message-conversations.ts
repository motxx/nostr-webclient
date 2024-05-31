import { MessageConversationType } from '../global/types'

export const mockConversations: MessageConversationType[] = [
  {
    id: '1',
    name: 'User 1',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    members: ['User 1'],
    messages: [
      {
        sender: 'User 1',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        content: 'Hello!',
      },
      {
        sender: 'User 1',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        content: 'Are you there?',
      },
      {
        sender: 'You',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: 'Hi!',
      },
      {
        sender: 'You',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: "I'm here!",
      },
      {
        sender: 'User 1',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        content: 'ok',
      },
    ],
  },
  {
    id: '2',
    name: 'Group Chat',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    members: ['User 2', 'User 3', 'You'],
    messages: [
      {
        sender: 'User 2',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'Hi everyone!',
      },
      {
        sender: 'User 3',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        content: 'Hello!',
      },
      {
        sender: 'You',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: 'How are you?',
      },
      {
        sender: 'User 2',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'I am fine, thank you!',
      },
      {
        sender: 'User 2',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'How about you?',
      },
      {
        sender: 'User 2',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: '...?',
      },
      {
        sender: 'User 2',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'Are you there?',
      },
      {
        sender: 'User 2',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'Hello?',
      },
      {
        sender: 'You',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: 'yes',
      },
      {
        sender: 'User 3',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        content: 'I am here!',
      },
      {
        sender: 'User 2',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'ok',
      },
      {
        sender: 'You',
        avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
        content: 'so, what are we going to do today?',
      },
      {
        sender: 'User 2',
        avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
        content: 'I have no idea',
      },
      {
        sender: 'User 3',
        avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
        content: 'me too',
      },
    ],
  },
]
