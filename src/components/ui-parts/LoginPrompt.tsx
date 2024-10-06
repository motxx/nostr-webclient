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
import { switchMap, tap } from 'rxjs'

const LoginPrompt: React.FC = () => {
  const {
    auth: { status },
    dispatch,
  } = useContext(AppContext)

  const handleLogin = useCallback(() => {
    dispatch({ type: OperationType.InitializeStart })

    disconnectNostrClient()
      .pipe(
        switchMap(() => {
          return connectNostrClient()
        }),
        switchMap((client) => {
          const userService = new UserService(client)
          const userProfileService = new UserProfileService(client)

          return (
            client.readOnlyMode()
              ? new FetchDefaultUser(userService).execute()
              : new LoginMyUser(userService, userProfileService).execute()
          ).pipe(
            tap((user) => {
              dispatch({
                type: OperationType.InitializeSuccess,
                nostrClient: client,
                ...(client.readOnlyMode() ? { readOnlyUser: user } : {}),
              })
              if (!client.readOnlyMode()) {
                dispatch({ type: OperationType.LoginSuccess, user })
              }
            })
          )
        })
      )
      .subscribe({
        error: (error) => {
          dispatch({ type: OperationType.InitializeFailure, error })
        },
      })
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
