import { useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { AuthStatus, authStatusAtom } from '@/state/auth'
import { noteServiceAtom } from '@/state/services'
import {
  timelineNotesAtom,
  timelineFetchingAtom,
  timelineErrorAtom,
} from '@/state/timeline'

interface UseFetchNotesOptions {
  authorPubkeys?: string[]
  limit?: number
  hashtag?: string
}

export const useFetchNotes = ({
  authorPubkeys,
  limit = 20,
  hashtag,
}: UseFetchNotesOptions) => {
  const authStatus = useAtomValue(authStatusAtom)
  const noteService = useAtomValue(noteServiceAtom)
  const notes = useAtomValue(timelineNotesAtom)
  const fetchingPastNotes = useAtomValue(timelineFetchingAtom)
  const setNotes = useSetAtom(timelineNotesAtom)
  const setFetching = useSetAtom(timelineFetchingAtom)
  const setError = useSetAtom(timelineErrorAtom)

  const fetchNotes = useCallback(() => {
    if (
      authStatus !== AuthStatus.ClientReady &&
      authStatus !== AuthStatus.LoggedIn
    ) {
      return
    }
    if (!noteService) return

    setFetching(true)

    const oldestNote = notes[notes.length - 1]
    noteService
      .fetchPastNotes({
        authorPubkeys,
        until: oldestNote?.created_at,
        limit,
        hashtag,
      })
      .match(
        (fetchedNotes) => {
          setNotes((prev) => {
            const merged = [
              ...new Map(
                [...prev, ...fetchedNotes].map((n) => [n.id, n])
              ).values(),
            ]
            return merged.sort(
              (a, b) => b.created_at.getTime() - a.created_at.getTime()
            )
          })
          setFetching(false)
        },
        (error) => {
          setError(error)
          setFetching(false)
        }
      )
  }, [
    authStatus,
    noteService,
    notes,
    authorPubkeys,
    limit,
    hashtag,
    setNotes,
    setFetching,
    setError,
  ])

  return {
    fetchNotes,
    isFetchingPastNotes: fetchingPastNotes,
  }
}
