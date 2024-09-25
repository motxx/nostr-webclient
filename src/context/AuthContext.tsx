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
import { useNostrClient } from '@/hooks/useNostrClient'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { UserService } from '@/infrastructure/services/UserService'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'
import { ok, ResultAsync } from 'neverthrow'

interface AuthContextProps {
  loggedInUser: User | null
  isLoggedIn: boolean
  nostrClient: NostrClient | null
  refreshAuth: (() => ResultAsync<User, Error>) | null
}

export const AuthContext = createContext<AuthContextProps>({
  loggedInUser: null,
  isLoggedIn: false,
  nostrClient: null,
  refreshAuth: null,
})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { nostrClient, refreshClient, isLoggedIn } = useNostrClient()
  const [isInitialized, setIsInitialized] = useState(false)
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null)

  const refreshAuth = useCallback(() => {
    return refreshClient().andThen((client) => {
      return new LoginMyUser(
        new UserService(client),
        new UserProfileService(client)
      )
        .execute()
        .andThen((user) => {
          if (isLoggedIn) {
            setLoggedInUser(user)
          }
          return ok(user)
        })
    })
  }, [refreshClient, isLoggedIn])

  useEffect(() => {
    if (isInitialized) {
      return
    }
    setIsInitialized(true)
    console.log('initialize auth')

    refreshAuth().match(
      (_) => {},
      (error) => {
        console.error(error)
      }
    )
  }, [isInitialized, refreshAuth])

  const contextValue = useMemo(
    () => ({
      loggedInUser,
      isLoggedIn,
      nostrClient,
      refreshAuth,
    }),
    [loggedInUser, isLoggedIn, nostrClient, refreshAuth]
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
