import { useState, useCallback, useEffect } from 'react'
import { useSubscribeNotes } from './useSubscribeNotes'
import { Note } from '@/domain/entities/Note'

interface UseInfiniteNotesOptions {
  authorPubkeys?: string[]
  limit?: number
  hashtag?: string // TODO: implement hashtag filtering
}

export const useInfiniteNotes = ({
  authorPubkeys,
  limit = 20,
  hashtag,
}: UseInfiniteNotesOptions) => {
  const { subscribe, unsubscribeAll } = useSubscribeNotes()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const isLoading = notes.length === 0

  const handleNote = useCallback((note: Note) => {
    setNotes((prevNotes) => {
      if (prevNotes.some((n) => n.id === note.id)) return prevNotes
      return [...prevNotes, note].sort(
        (a, b) => b.created_at.getTime() - a.created_at.getTime()
      )
    })
  }, [])

  const loadMoreNotes = useCallback(() => {
    if (isLoadingMore || notes.length === 0) return

    setIsLoadingMore(true)
    const oldestNote = notes[notes.length - 1]
    subscribe((note) => handleNote(note), {
      authorPubkeys,
      until: oldestNote.created_at,
      limit,
      hashtag,
      isForever: false,
    }).then(() => {
      setIsLoadingMore(false)
    })
  }, [
    isLoadingMore,
    notes,
    subscribe,
    handleNote,
    authorPubkeys,
    limit,
    hashtag,
  ])

  useEffect(() => {
    document.addEventListener('nlAuth', (e: Event) => {
      const detail = e as CustomEvent<{ type: string }>
      if (detail.detail.type === 'login') {
        unsubscribeAll()
        setIsLoadingMore(false)
        setNotes([])
      }
    })

    return () => {
      document.removeEventListener('nlAuth', () => {})
    }
  }, [isLoading, loadMoreNotes, unsubscribeAll])

  useEffect(() => {
    if (!isLoading) return

    subscribe((note) => handleNote(note), {
      authorPubkeys,
      limit,
      hashtag,
      isForever: true,
    })
  }, [notes, isLoading, subscribe, handleNote, authorPubkeys, limit, hashtag])

  return { notes, isLoading, isLoadingMore, loadMoreNotes }
}
