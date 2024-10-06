import { useCallback, useContext } from 'react'
import { AppContext } from '@/context/AppContext'
import { AuthStatus } from '@/context/types'
import { Conversation } from '@/domain/entities/Conversation'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { ok, Result } from 'neverthrow'
import { hexToBech32 } from '@/utils/addressConverter'
import { FetchUser } from '@/domain/use_cases/FetchUser'
import { Participant } from '@/domain/entities/Participant'
import { OperationType } from '@/context/actions'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { SendDirectMessage } from '@/domain/use_cases/SendDirectMessage'
import { User } from '@/domain/entities/User'
import { Observable, toArray } from 'rxjs'

export const useMessageActions = () => {
  const {
    auth: { status: authStatus, nostrClient, loggedInUser },
    messages: { conversations },
    dispatch,
  } = useContext(AppContext)

  const createNewConversation = useCallback(
    (chatName: string, otherParticipantPubkeys: string[]) => {
      if (authStatus !== AuthStatus.LoggedIn) {
        return
      }
      if (!nostrClient || !loggedInUser) {
        throw new Error('NostrClient or LoggedInUser is not ready')
      }

      const conversationId = Conversation.generateId(
        [...new Set([loggedInUser.pubkey, ...otherParticipantPubkeys])],
        chatName
      )
      if (conversations.some((conv) => conv.id === conversationId)) {
        return
      }

      const userProfileService = new UserProfileService(nostrClient)

      const fetchUsers$: Observable<User> = new Observable((subscriber) => {
        otherParticipantPubkeys.forEach((pubkey) => {
          hexToBech32(pubkey).match(
            (npub) => {
              new FetchUser(userProfileService).execute(npub).subscribe({
                next: (user) => subscriber.next(user),
                error: (error) => subscriber.error(error),
              })
            },
            (error) => subscriber.error(error)
          )
        })
        subscriber.complete()
      })

      fetchUsers$.pipe(toArray()).subscribe({
        next: (users) => {
          // TODO: DirectMessage.createParticipants() と共通化し、Conversationに移す
          Result.combine(
            Array.from(
              new Set([
                loggedInUser.pubkey,
                ...users.map((user) => user.pubkey),
              ])
            ).map((pubkey) => {
              return hexToBech32(pubkey, 'npub').map(
                (npub) => new Participant(new User({ pubkey, npub }))
              )
            })
          )
            .andThen((participants) =>
              ok(Conversation.create(new Set(participants), chatName))
            )
            .match(
              (newConversation) => {
                dispatch({
                  type: OperationType.CreateNewConversation,
                  conversation: newConversation,
                })
              },
              (error) => {
                dispatch({
                  type: OperationType.CreateNewConversationError,
                  error,
                })
              }
            )
        },
        error: (error) => {
          dispatch({ type: OperationType.CreateNewConversationError, error })
        },
      })
    },
    [nostrClient, dispatch, authStatus, conversations, loggedInUser]
  )

  const sendDirectMessage = useCallback(
    (conversation: Conversation, content: string) => {
      if (authStatus !== AuthStatus.LoggedIn) {
        return
      }
      if (!nostrClient || !loggedInUser) {
        throw new Error('NostrClient or loggedInUser is not ready')
      }

      const directMessage = DirectMessage.create(
        loggedInUser,
        Array.from(conversation.participants),
        content,
        conversation.subject
      )

      new SendDirectMessage(new DirectMessageService(nostrClient))
        .execute(directMessage)
        .subscribe({
          next: () => {
            dispatch({
              type: OperationType.SendMessage,
              message: directMessage,
            })
          },
          error: (error) => {
            dispatch({ type: OperationType.SendMessageError, error })
          },
        })
    },
    [authStatus, nostrClient, loggedInUser, dispatch]
  )

  return { createNewConversation, sendDirectMessage }
}
