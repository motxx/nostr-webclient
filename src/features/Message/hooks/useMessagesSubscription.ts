import { useCallback, useContext } from 'react'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { SubscribeDirectMessages } from '@/domain/use_cases/SubscribeDirectMessages'
import { AppContext } from '@/context/AppContext'
import { AuthStatus, MessagesStatus } from '@/context/types'
import { OperationType } from '@/context/actions'

export const useMessagesSubscription = () => {
  const {
    auth: { nostrClient, status: authStatus },
    messages: { subscription, status: messagesStatus },
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

    dispatch({ type: OperationType.InitializeMessageSubscription })

    new SubscribeDirectMessages(new DirectMessageService(nostrClient))
      .execute((conversation) => {
        // TODO: MessageとConversationの包含関係を整理する
        dispatch({ type: OperationType.AddNewMessage, conversation })
      })
      .match(
        (subscription) => {
          dispatch({ type: OperationType.SubscribeMessages, subscription })
        },
        (error) => {
          dispatch({ type: OperationType.SubscribeMessagesError, error })
        }
      )
  }, [nostrClient, authStatus, messagesStatus, dispatch])

  const unsubscribe = useCallback(() => {
    if (subscription) {
      subscription.unsubscribe()
    }
  }, [subscription])

  return { subscribe, unsubscribe }
}
