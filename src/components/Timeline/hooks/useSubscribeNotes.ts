import { useCallback } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { Note } from '@/domain/entities/Note'
import { SubscribeNotesOptions } from '@/domain/repositories/NoteRepository'
import { AuthStatus, authStatusAtom } from '@/state/auth'
import { noteServiceAtom } from '@/state/services'
import {
  SubscriptionStatus,
  timelineNotesAtom,
  timelineSubscriptionAtom,
  timelineSubscriptionStatusAtom,
  timelineFetchingAtom,
  timelineErrorAtom,
} from '@/state/timeline'

export const useSubscribeNotes = () => {
  const authStatus = useAtomValue(authStatusAtom)
  const noteService = useAtomValue(noteServiceAtom)
  const notes = useAtomValue(timelineNotesAtom)
  const subscription = useAtomValue(timelineSubscriptionAtom)
  const subscriptionStatus = useAtomValue(timelineSubscriptionStatusAtom)
  const setNotes = useSetAtom(timelineNotesAtom)
  const setSubscription = useSetAtom(timelineSubscriptionAtom)
  const setSubscriptionStatus = useSetAtom(timelineSubscriptionStatusAtom)
  const setFetching = useSetAtom(timelineFetchingAtom)
  const setError = useSetAtom(timelineErrorAtom)

  const subscribe = useCallback(
    (options: SubscribeNotesOptions) => {
      if (
        authStatus !== AuthStatus.ClientReady &&
        authStatus !== AuthStatus.LoggedIn
      ) {
        return
      }
      if (!noteService) return
      if (subscriptionStatus !== SubscriptionStatus.Idle) return

      setFetching(true)

      noteService.fetchPastNotes({ ...options, limit: 20 }).match(
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

      noteService
        .subscribeNotes((note: Note) => {
          setNotes((prev) => {
            if (prev.some((n) => n.id === note.id)) return prev
            return [...prev, note].sort(
              (a, b) => b.created_at.getTime() - a.created_at.getTime()
            )
          })
        }, options)
        .match(
          (sub) => {
            setSubscription(sub)
            setSubscriptionStatus(SubscriptionStatus.Subscribing)
          },
          (error) => {
            setError(error)
          }
        )
    },
    [
      authStatus,
      noteService,
      subscriptionStatus,
      setNotes,
      setSubscription,
      setSubscriptionStatus,
      setFetching,
      setError,
    ]
  )

  const unsubscribe = useCallback(() => {
    if (!subscription) return
    subscription.unsubscribe()
    setSubscriptionStatus(SubscriptionStatus.Idle)
    setSubscription(null)
    setNotes([])
    setFetching(false)
    setError(null)
  }, [
    subscription,
    setSubscriptionStatus,
    setSubscription,
    setNotes,
    setFetching,
    setError,
  ])

  return { subscribe, unsubscribe, notes }
}
