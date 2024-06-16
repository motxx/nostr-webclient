import React, { useState } from 'react'
import { FiSend } from 'react-icons/fi'
import replyData from '@/data/dummy-reply-data'
import NoteItem from '@/components/NoteItem/NoteItem'
import PrimaryButton from '@/components/ui-parts/PrimaryButton'
import { NoteType } from '@/domain/entities/Note'

interface RepliesThreadProps {
  originalNote: NoteType
  onToggleFollow: (userId: string) => boolean
}

const RepliesThread: React.FC<RepliesThreadProps> = ({
  originalNote,
  onToggleFollow,
}) => {
  const [newReply, setNewReply] = useState('')

  const handleNewReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReply(e.target.value)
  }

  const handleReplyToReply = (userId: string) => {
    setNewReply(`@${userId} `)
  }

  const handleNewReplySubmit = () => {
    if (newReply.trim()) {
      replyData.push({
        id: '109',
        author: {
          npub: 'npubexample',
          pubkey: 'pubkeyexample',
          profile: {
            name: 'moti',
            image: 'https://randomuser.me/api/portraits/men/5.jpg',
            nostrAddress: '_@motxx.pages.dev',
          },
        },
        text: newReply,
        created_at: new Date(),
        replies: 0,
        likes: 0,
        reposts: 0,
        zaps: 0,
        following: true,
        json: '{"example":"json"}',
      })
      setNewReply('')
    }
  }

  return (
    <div className="h-full p-4 overflow-y-auto bg-white dark:bg-black border-gray-200 dark:border-gray-700 border-l">
      <div className="mb-6">
        <NoteItem
          note={{
            ...originalNote,
            media: undefined,
          }}
          onToggleFollow={onToggleFollow}
          onReply={handleReplyToReply}
        />
      </div>

      <div className="mb-6">
        <textarea
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-transparent"
          placeholder="リプライを入力..."
          value={newReply}
          onChange={handleNewReplyChange}
        />
        <PrimaryButton
          className="mt-2 px-4 py-2 rounded-md"
          onClick={handleNewReplySubmit}
        >
          <FiSend className="mr-2" />
          返信
        </PrimaryButton>
      </div>

      <div className="text-gray-700 dark:text-gray-300">
        {replyData.map((reply, index) => (
          <div key={index} className="mb-4">
            <NoteItem
              note={reply}
              onToggleFollow={onToggleFollow}
              onReply={handleReplyToReply}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default RepliesThread
