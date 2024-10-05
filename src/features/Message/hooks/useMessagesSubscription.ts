import { useCallback, useContext, useRef } from 'react'
import { DirectMessageService } from '@/infrastructure/services/DirectMessageService'
import { SubscribeDirectMessages } from '@/domain/use_cases/SubscribeDirectMessages'
import { AppContext } from '@/context/AppContext'
import { AuthStatus } from '@/context/types'
import { OperationType } from '@/context/actions'
import { Subscription } from 'rxjs'

export const useMessagesSubscription = () => {
  const {
    auth: { nostrClient, status: authStatus },
    dispatch,
  } = useContext(AppContext)

  // 再レンダリングを防ぐためにuseRefを使う(messages.statusは依存配列に影響するので使わない)
  const subscriptionRef = useRef<Subscription | null>(null)
  const isSubscribingRef = useRef<boolean>(false)

  const subscribe = useCallback(() => {
    if (authStatus !== AuthStatus.LoggedIn) {
      return
    }
    if (!nostrClient) {
      throw new Error('NostrClient is not ready')
    }

    if (isSubscribingRef.current) {
      return
    }
    isSubscribingRef.current = true

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

    subscriptionRef.current = subscription
    dispatch({ type: OperationType.SubscribeMessages })

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        isSubscribingRef.current = false
        dispatch({ type: OperationType.UnsubscribeMessages })
      }
    }
  }, [nostrClient, authStatus, dispatch])

  return { subscribe }
}
