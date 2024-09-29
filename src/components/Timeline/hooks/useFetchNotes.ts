import {
  OperationType as SubscriptionOperationType,
  SubscriptionContext,
} from '@/context/SubscriptionContext'
import { useCallback, useContext } from 'react'
import { FetchPastNotes } from '@/domain/use_cases/FetchPastNotes'
import { NoteService } from '@/infrastructure/services/NoteService'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { AuthContext, AuthStatus } from '@/context/AuthContext'

interface UseFetchNotesOptions {
  authorPubkeys?: string[]
  limit?: number
  hashtag?: string // TODO: implement hashtag filtering
}

export const useFetchNotes = ({
  authorPubkeys,
  limit = 20,
  hashtag,
}: UseFetchNotesOptions) => {
  const { nostrClient, status } = useContext(AuthContext)
  const {
    dispatch: subscriptionDispatch,
    notes,
    fetchingPastNotes,
  } = useContext(SubscriptionContext)

  const fetchNotes = useCallback(() => {
    if (status !== AuthStatus.ClientReady && status !== AuthStatus.LoggedIn) {
      return
    }
    if (!nostrClient) {
      throw new Error('Nostr client not found')
    }

    subscriptionDispatch({
      type: SubscriptionOperationType.FetchPastNotesStart,
    })

    const oldestNote = notes[notes.length - 1]
    new FetchPastNotes(
      new NoteService(nostrClient, new UserProfileService(nostrClient))
    )
      .execute({
        authorPubkeys,
        until: oldestNote.created_at,
        limit,
        hashtag,
      })
      .match(
        (notes) => {
          subscriptionDispatch({
            type: SubscriptionOperationType.FetchPastNotesEnd,
            notes,
          })
        },
        (error) => {
          console.error('Failed to fetch past notes', error)
        }
      )
  }, [
    status,
    nostrClient,
    subscriptionDispatch,
    notes,
    authorPubkeys,
    limit,
    hashtag,
  ])

  return {
    fetchNotes,
    isFetchingPastNotes: fetchingPastNotes,
  }
}
