import { Dispatch, ReactNode, createContext, useReducer } from 'react'
import { User } from '@/domain/entities/User'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'

export enum AuthStatus {
  Idle = 'idle',
  Initializing = 'initializing',
  ClientReady = 'client_ready',
  LoggedIn = 'logged_in',
  Error = 'error',
}

interface AuthState {
  status: AuthStatus
  loggedInUser: User | null
  readOnlyUser: User | null
  nostrClient: NostrClient | null
  error: Error | null
  dispatch: Dispatch<AuthAction>
}

export enum OperationType {
  InitializeStart = 'InitializeStart',
  InitializeSuccess = 'InitializeSuccess',
  InitializeFailure = 'InitializeFailure',
  LoginSuccess = 'LoginSuccess',
  LoginFailure = 'LoginFailure',
}

type AuthAction =
  | { type: OperationType.InitializeStart }
  | {
      type: OperationType.InitializeSuccess
      nostrClient: NostrClient
      readOnlyUser?: User
    }
  | { type: OperationType.InitializeFailure; error: Error }
  | { type: OperationType.LoginSuccess; user: User }
  | { type: OperationType.LoginFailure; error: Error }
//  | { type: 'LOGOUT' }

export const initialState: AuthState = {
  status: AuthStatus.Idle,
  loggedInUser: null,
  readOnlyUser: null,
  nostrClient: null,
  error: null,
  dispatch: () => {},
}

export const authReducer = (
  state: AuthState,
  action: AuthAction
): AuthState => {
  console.log('authReducer - state', action)
  switch (action.type) {
    case OperationType.InitializeStart:
      return { ...state, status: AuthStatus.Initializing, error: null }
    case OperationType.InitializeSuccess:
      return {
        ...state,
        status: AuthStatus.ClientReady,
        nostrClient: action.nostrClient,
        readOnlyUser: action.readOnlyUser ?? null,
      }
    case OperationType.InitializeFailure:
      return { ...state, status: AuthStatus.Error, error: action.error }
    case OperationType.LoginSuccess:
      return {
        ...state,
        status: AuthStatus.LoggedIn,
        loggedInUser: action.user,
      }
    case OperationType.LoginFailure:
      return { ...state, status: AuthStatus.Error, error: action.error }
  }
}

interface AuthContextProps {
  nostrClient: NostrClient | null
  loggedInUser: User | null
  readOnlyUser: User | null
  error: Error | null
  status: AuthStatus
  dispatch: Dispatch<AuthAction>
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthContext = createContext<AuthContextProps>({
  loggedInUser: null,
  readOnlyUser: null,
  nostrClient: null,
  error: null,
  status: AuthStatus.Idle,
  dispatch: () => {},
})

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const contextValue: AuthContextProps = {
    loggedInUser: state.loggedInUser,
    readOnlyUser: state.readOnlyUser,
    nostrClient: state.nostrClient,
    error: state.error,
    status: state.status,
    dispatch,
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}
