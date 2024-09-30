import { useCallback, useContext } from 'react'
import { FetchPastNotes } from '@/domain/use_cases/FetchPastNotes'
import { NoteService } from '@/infrastructure/services/NoteService'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { AuthStatus } from '@/context/types'
import { AppContext } from '@/context/AppContext'
import { OperationType } from '@/context/actions'

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
  const {
    auth: { nostrClient, status },
    subscription: { notes, fetchingPastNotes },
    dispatch,
  } = useContext(AppContext)

  const fetchNotes = useCallback(() => {
    if (status !== AuthStatus.ClientReady && status !== AuthStatus.LoggedIn) {
      return
    }
    if (!nostrClient) {
      throw new Error('Nostr client not found')
    }

    dispatch({ type: OperationType.FetchPastNotesStart })

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
          dispatch({ type: OperationType.FetchPastNotesEnd, notes })
        },
        (error) => {
          console.error('Failed to fetch past notes', error)
        }
      )
  }, [status, nostrClient, dispatch, notes, authorPubkeys, limit, hashtag])

  return {
    fetchNotes,
    isFetchingPastNotes: fetchingPastNotes,
  }
}
