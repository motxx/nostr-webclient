import {
  createContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
  useEffect,
} from 'react'
import { User } from '@/domain/entities/User'
import { LoginMyUser } from '@/domain/use_cases/LoginMyUser'
import { UserService } from '@/infrastructure/services/UserService'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { ok, ResultAsync } from 'neverthrow'
import { eventBus } from '@/utils/eventBus'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { useNostrClient } from '@/hooks/useNostrClient'

interface AuthContextProps {
  loggedInUser: User | null
  isUserLoggedIn: () => boolean
  nostrClient: NostrClient | null
  refreshAuth: () => ResultAsync<NostrClient, Error>
}

export const AuthContext = createContext<AuthContextProps>({
  loggedInUser: null,
  isUserLoggedIn: () => {
    throw new Error('Not implemented')
  },
  nostrClient: null,
  refreshAuth: () =>
    ResultAsync.fromPromise(
      Promise.reject(new Error('Not implemented')),
      (error) => error as Error
    ),
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isInitialized, setIsInitialized] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)
  const { refreshClient, isUserLoggedIn, nostrClient } = useNostrClient()

  const refreshAuth = useCallback(() => refreshClient(), [refreshClient])

  const initializeAuth = useCallback(() => {
    if (!isInitialized) {
      setIsInitialized(true)
      refreshAuth().match(
        () => {},
        (error) => console.error(error)
      )
    }
  }, [isInitialized, refreshAuth])

  const handleLogin = useCallback(() => {
    if (nostrClient && isUserLoggedIn()) {
      new LoginMyUser(
        new UserService(nostrClient),
        new UserProfileService(nostrClient)
      )
        .execute()
        .andThen((user) => {
          setLoggedInUser(user)
          eventBus.emit('login', { user })
          return ok(user)
        })
    }
  }, [nostrClient, isUserLoggedIn])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    handleLogin()
  }, [handleLogin])

  const contextValue: AuthContextProps = useMemo(
    () => ({
      loggedInUser,
      isUserLoggedIn,
      nostrClient,
      refreshAuth,
    }),
    [loggedInUser, isUserLoggedIn, nostrClient, refreshAuth]
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
