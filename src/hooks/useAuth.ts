import { useCallback, useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import {
  AuthStatus,
  authStatusAtom,
  nostrClientAtom,
  loggedInUserAtom,
  readOnlyUserAtom,
  authErrorAtom,
} from '@/state/auth'
import { UserService } from '@/infrastructure/services/UserService'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import {
  connectNostrClient,
  disconnectNostrClient,
} from '@/infrastructure/nostr/nostrClient'
import { ok } from 'neverthrow'

export const useAuth = () => {
  const [status, setStatus] = useAtom(authStatusAtom)
  const setNostrClient = useSetAtom(nostrClientAtom)
  const setLoggedInUser = useSetAtom(loggedInUserAtom)
  const setReadOnlyUser = useSetAtom(readOnlyUserAtom)
  const setError = useSetAtom(authErrorAtom)

  const handleLogin = useCallback(() => {
    setStatus(AuthStatus.Initializing)

    disconnectNostrClient()
      .andThen(() => connectNostrClient())
      .match(
        (client) => {
          const userService = new UserService(client)

          if (client.readOnlyMode()) {
            userService.fetchDefaultUser().match(
              (user) => {
                setNostrClient(client)
                setReadOnlyUser(user)
                setStatus(AuthStatus.ClientReady)
              },
              (error) => {
                setStatus(AuthStatus.Error)
                setError(error)
              }
            )
          } else {
            setNostrClient(client)
            setStatus(AuthStatus.ClientReady)

            const userProfileService = new UserProfileService(client)

            // Inline LoginMyUser logic
            userService
              .login()
              .andThen((user) =>
                userProfileService
                  .fetchProfile(user.npub)
                  .andThen((profile) => {
                    user.profile = profile
                    return userService
                      .fetchLoggedInUserFollows()
                      .andThen((follows) => {
                        user.followingUsers = follows
                        return ok(user)
                      })
                  })
              )
              .match(
                (user) => {
                  setLoggedInUser(user)
                  setStatus(AuthStatus.LoggedIn)
                },
                (error) => {
                  setStatus(AuthStatus.Error)
                  setError(error)
                }
              )
          }
        },
        (error) => {
          setStatus(AuthStatus.Error)
          setError(error)
        }
      )
  }, [setStatus, setNostrClient, setLoggedInUser, setReadOnlyUser, setError])

  const autoLogin = useCallback(() => {
    if (status !== AuthStatus.Idle) return
    handleLogin()
  }, [handleLogin, status])

  useEffect(() => {
    autoLogin()
  }, [autoLogin])

  return { status, handleLogin }
}
