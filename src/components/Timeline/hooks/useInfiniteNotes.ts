import { useState, useCallback, useEffect } from 'react'
import { useSubscribeNotes } from './useSubscribeNotes'
import { Note } from '@/domain/entities/Note'
import { eventBus } from '@/utils/eventBus'
import { timelineNotesAtom } from '@/state/atoms'
import { useAtom } from 'jotai'

interface UseInfiniteNotesOptions {
  global?: boolean
  authorPubkeys?: string[]
  limit?: number
  hashtag?: string // TODO: implement hashtag filtering
}

export const useInfiniteNotes = ({
  global,
  authorPubkeys,
  limit = 20,
  hashtag,
}: UseInfiniteNotesOptions) => {
  const { subscribe, unsubscribeAll } = useSubscribeNotes()
  const [notes, setNotes] = useAtom(timelineNotesAtom)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const isLoading = notes.length === 0

  const handleNote = useCallback(
    (note: Note) => {
      setNotes((prevNotes) => {
        if (prevNotes.some((n) => n.id === note.id)) return prevNotes
        return [...prevNotes, note].sort(
          (a, b) => b.created_at.getTime() - a.created_at.getTime()
        )
      })
    },
    [setNotes]
  )

  const loadMoreNotes = useCallback(() => {
    if (isLoadingMore || notes.length === 0) return

    setIsLoadingMore(true)
    const oldestNote = notes[notes.length - 1]
    subscribe((note) => handleNote(note), {
      global,
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
    global,
  ])

  useEffect(() => {
    if (isInitialized) return
    setIsInitialized(true)

    const cleanupWhenLoggedIn = () => {
      console.log('cleanupWhenLoggedIn')
      unsubscribeAll()
      setIsLoadingMore(false)
      setNotes([])
    }

    eventBus.on('refreshNoteSubscription', cleanupWhenLoggedIn)
  }, [isInitialized, setNotes, unsubscribeAll])

  useEffect(() => {
    if (!isLoading) return
    console.log('subscribe')

    subscribe((note) => handleNote(note), {
      global,
      authorPubkeys,
      limit,
      hashtag,
      isForever: true,
    })
  }, [
    notes,
    isLoading,
    subscribe,
    handleNote,
    authorPubkeys,
    limit,
    hashtag,
    global,
  ])

  return { notes, isLoading, isLoadingMore, loadMoreNotes }
}
