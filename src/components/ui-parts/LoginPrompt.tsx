import React, { useCallback, useContext, useEffect } from 'react'
import PrimaryButton from '@/components/ui-parts/PrimaryButton'
import { init } from 'nostr-login'
import { AppContext } from '@/context/AppContext'
import { OperationType } from '@/context/actions'
import {
  connectNostrClient,
  disconnectNostrClient,
} from '@/infrastructure/nostr/nostrClient'
import { LoginMyUser } from '@/domain/use_cases/LoginMyUser'
import { UserService } from '@/infrastructure/services/UserService'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { FetchDefaultUser } from '@/domain/use_cases/FetchDefaultUser'
import { AuthStatus } from '@/context/types'

const LoginPrompt: React.FC = () => {
  const {
    auth: { status },
    dispatch,
  } = useContext(AppContext)

  const handleLogin = useCallback(() => {
    dispatch({ type: OperationType.InitializeStart })

    return disconnectNostrClient()
      .andThen(() => connectNostrClient())
      .match(
        (client) => {
          const userService = new UserService(client)

          if (client.readOnlyMode()) {
            new FetchDefaultUser(userService).execute().match(
              (user) => {
                dispatch({
                  type: OperationType.InitializeSuccess,
                  nostrClient: client,
                  readOnlyUser: user,
                })
              },
              (error) => {
                dispatch({ type: OperationType.InitializeFailure, error })
              }
            )
          } else {
            dispatch({
              type: OperationType.InitializeSuccess,
              nostrClient: client,
            })
            new LoginMyUser(userService, new UserProfileService(client))
              .execute()
              .match(
                (user) => {
                  dispatch({ type: OperationType.LoginSuccess, user })
                },
                (error) => {
                  dispatch({ type: OperationType.LoginFailure, error })
                }
              )
          }
        },
        (error) => {
          dispatch({ type: OperationType.InitializeFailure, error })
        }
      )
  }, [dispatch])

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
