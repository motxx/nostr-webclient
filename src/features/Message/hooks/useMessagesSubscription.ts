import { useCallback, useContext, useRef } from 'react'
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

  const isSubscribing = useRef<boolean>(false)

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

    if (isSubscribing.current) {
      return
    }
    isSubscribing.current = true

    const subscription = new SubscribeDirectMessages(
      new DirectMessageService(nostrClient)
    )
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

    dispatch({ type: OperationType.SubscribeMessages, subscription })

    return () => {
      if (subscription) {
        subscription.unsubscribe()
        isSubscribing.current = false
        dispatch({ type: OperationType.UnsubscribeMessages })
      }
    }
  }, [nostrClient, authStatus, messagesStatus, dispatch, isSubscribing])

  return { subscribe }
}
