import { useCallback, useContext, useEffect } from 'react'
import { useMessagesSubscription } from './useMessagesSubscription'
import { AppContext } from '@/context/AppContext'
import { AuthStatus, MessagesStatus } from '@/context/types'
import { Conversation } from '@/domain/entities/Conversation'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { ok, Result, ResultAsync } from 'neverthrow'
import { hexToBech32 } from '@/utils/addressConverter'
import { FetchUser } from '@/domain/use_cases/FetchUser'
import { Participant } from '@/domain/entities/Participant'
import { OperationType } from '@/context/actions'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { SendDirectMessage } from '@/domain/use_cases/SendDirectMessage'
import { User } from '@/domain/entities/User'

export const useMessageConversations = () => {
  const {
    auth: { status: authStatus, nostrClient, loggedInUser },
    messages: { status: messagesStatus, conversations },
    dispatch,
  } = useContext(AppContext)
  const { subscribe, unsubscribe } = useMessagesSubscription()

  const handleSubscription = useCallback(() => {
    console.log('handleSubscription')
    if (
      authStatus !== AuthStatus.LoggedIn ||
      messagesStatus !== MessagesStatus.Idle
    ) {
      console.log({ authStatus, messagesStatus })
      return
    }
    console.log('handleSubscription - 2')

    subscribe()
  }, [authStatus, messagesStatus, subscribe])

  useEffect(() => {
    handleSubscription()
    return () => {
      unsubscribe()
    }
  }, [handleSubscription, unsubscribe])

  const addNewConversation = useCallback(
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
      const fetchUsers = ResultAsync.combine(
        otherParticipantPubkeys.map((pubkey) =>
          hexToBech32(pubkey).asyncAndThen((npub) =>
            new FetchUser(userProfileService).execute(npub)
          )
        )
      )

      fetchUsers
        .andThen((users) => {
          // TODO: DirectMessage.createParticipants() と共通化し、Conversationに移す
          return Result.combine(
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
          ).andThen((participants) =>
            ok(Conversation.create(new Set(participants), chatName))
          )
        })
        .match(
          (newConversation) => {
            dispatch({
              type: OperationType.CreateNewConversation,
              conversation: newConversation,
            })
          },
          (error) => {
            dispatch({ type: OperationType.CreateNewConversationError, error })
          }
        )
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
        .match(
          () => {
            dispatch({
              type: OperationType.SendMessage,
              message: directMessage,
            })
          },
          (error) => {
            dispatch({ type: OperationType.SendMessageError, error })
          }
        )
    },
    [authStatus, nostrClient, loggedInUser, dispatch]
  )

  return { conversations, addNewConversation, sendDirectMessage }
}
