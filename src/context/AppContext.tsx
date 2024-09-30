import React, {
  createContext,
  useReducer,
  ReactNode,
  Dispatch,
  useMemo,
} from 'react'
import { appReducer, initialState } from './reducers'
import { AppState } from './types'
import { AppAction } from './actions'

interface AppContextProps extends AppState {
  dispatch: Dispatch<AppAction>
}

export const AppContext = createContext<AppContextProps>({
  ...initialState,
  dispatch: () => {},
})

interface AppProviderProps {
  children: ReactNode
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const contextValue = useMemo(
    () => ({ ...state, dispatch }),
    [state, dispatch]
  )

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  )
}
