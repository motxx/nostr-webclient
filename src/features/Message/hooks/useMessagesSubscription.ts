import { useCallback, useContext } from 'react'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { SubscribeDirectMessages } from '@/domain/use_cases/SubscribeDirectMessages'
import { AppContext } from '@/context/AppContext'
import { AuthStatus, MessagesStatus } from '@/context/types'
import { OperationType } from '@/context/actions'

export const useMessagesSubscription = () => {
  const {
    auth: { nostrClient, status: authStatus },
    messages: { status: messagesStatus },
    dispatch,
  } = useContext(AppContext)

  const subscribe = useCallback(() => {
    if (
      authStatus !== AuthStatus.LoggedIn &&
      messagesStatus !== MessagesStatus.Subscribing
    ) {
      return
    }
    if (!nostrClient) {
      throw new Error('NostrClient is not ready')
    }

    dispatch({ type: OperationType.SubscribeMessages })

    new SubscribeDirectMessages(new DirectMessageService(nostrClient))
      .execute()
      .subscribe({
        next: (conversation) => {
          // TODO: MessageとConversationの包含関係を整理する
          dispatch({ type: OperationType.AddNewMessage, conversation })
        },
        error: (error) => {
          dispatch({ type: OperationType.SubscribeMessagesError, error })
        },
      })
  }, [nostrClient, authStatus, messagesStatus, dispatch])

  return { subscribe }
}
