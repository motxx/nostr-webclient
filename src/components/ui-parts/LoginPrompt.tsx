import React, { useCallback, useContext, useEffect } from 'react'
import PrimaryButton from '@/components/ui-parts/PrimaryButton'
import { init } from 'nostr-login'
import {
  AuthContext,
  AuthStatus,
  OperationType as AuthOperationType,
} from '@/context/AuthContext'
import { OperationType as SubscriptionOperationType } from '@/context/SubscriptionContext'
import { connectNostrClient } from '@/infrastructure/nostr/nostrClient'
import { LoginMyUser } from '@/domain/use_cases/LoginMyUser'
import { UserService } from '@/infrastructure/services/UserService'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { SubscriptionContext } from '@/context/SubscriptionContext'
import { User } from '@/domain/entities/User'
import { FetchDefaultUser } from '@/domain/use_cases/FetchDefaultUser'

const LoginPrompt: React.FC = () => {
  const { dispatch: authDispatch, status } = useContext(AuthContext)
  const { dispatch: subscriptionDispatch } = useContext(SubscriptionContext)

  const handleLogin = useCallback(() => {
    authDispatch({ type: AuthOperationType.InitializeStart })

    return connectNostrClient().match(
      (client) => {
        const userService = new UserService(client)

        if (client.readOnlyMode()) {
          new FetchDefaultUser(userService).execute().match(
            (user) => {
              authDispatch({
                type: AuthOperationType.InitializeSuccess,
                nostrClient: client,
                readOnlyUser: user,
              })
            },
            (error) => {
              authDispatch({ type: AuthOperationType.InitializeFailure, error })
            }
          )
          subscriptionDispatch({
            type: SubscriptionOperationType.InitializeStart,
          })
        } else {
          authDispatch({
            type: AuthOperationType.InitializeSuccess,
            nostrClient: client,
          })
          new LoginMyUser(userService, new UserProfileService(client))
            .execute()
            .match(
              (user) => {
                authDispatch({ type: AuthOperationType.LoginSuccess, user })
                subscriptionDispatch({
                  type: SubscriptionOperationType.InitializeStart,
                })
              },
              (error) => {
                authDispatch({ type: AuthOperationType.LoginFailure, error })
              }
            )
        }
      },
      (error) => {
        authDispatch({ type: AuthOperationType.InitializeFailure, error })
      }
    )
  }, [authDispatch, subscriptionDispatch])

  const openLoginModal = async () => {
    await init({ onAuth: handleLogin })
  }

  const autoLogin = useCallback(() => {
    if (status !== AuthStatus.Idle) {
      return
    }
    handleLogin()
  }, [handleLogin, status])

  useEffect(() => {
    autoLogin()
  }, [autoLogin])

  if (status === AuthStatus.LoggedIn) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <p className="pl-2 sm:pl-4 text-gray-700 dark:text-gray-300 font-semibold font-mplus-2">
          ログインしてNostrを始めよう
        </p>
        <PrimaryButton className="py-2 px-4" onClick={openLoginModal}>
          ログイン
        </PrimaryButton>
      </div>
      <hr className="border-1 border-gray-200 dark:border-gray-700" />
    </>
  )
}

export default LoginPrompt
