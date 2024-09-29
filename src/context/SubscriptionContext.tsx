import { Note } from '@/domain/entities/Note'
import { createContext, Dispatch, useReducer } from 'react'

export enum SubscriptionStatus {
  Idle = 'idle',
  Subscribing = 'subscribing',
  Error = 'error',
}

interface SubscriptionState {
  status: SubscriptionStatus
  notes: Note[]
  error: Error | null
  subscription: { unsubscribe: () => void } | null
  fetchingPastNotes: boolean // 永続subscribeと独立に動くため、statusと別で管理
}

export enum OperationType {
  InitializeStart = 'InitializeStart',
  SubscribeNotes = 'SubscribeNotes',
  UnsubscribeNotes = 'UnsubscribeNotes',
  FetchPastNotesStart = 'FetchPastNotesStart',
  FetchPastNotesEnd = 'FetchPastNotesEnd',
  AddNewNote = 'AddNewNote',
}

type SubscriptionAction =
  | { type: OperationType.InitializeStart }
  | {
      type: OperationType.SubscribeNotes
      subscription: { unsubscribe: () => void }
    }
  | {
      type: OperationType.FetchPastNotesStart
    }
  | {
      type: OperationType.FetchPastNotesEnd
      notes: Note[]
    }
  | {
      type: OperationType.UnsubscribeNotes
    }
  | {
      type: OperationType.AddNewNote
      note: Note
    }

export const initialState: SubscriptionState = {
  status: SubscriptionStatus.Idle,
  notes: [],
  error: null,
  subscription: null,
  fetchingPastNotes: false,
}

export const subscriptionReducer = (
  state: SubscriptionState,
  action: SubscriptionAction
): SubscriptionState => {
  console.log('subscriptionReducer - state', action)
  switch (action.type) {
    case OperationType.InitializeStart:
      return { ...state, status: SubscriptionStatus.Idle, notes: [] }
    case OperationType.SubscribeNotes:
      return {
        ...state,
        status: SubscriptionStatus.Subscribing,
        subscription: action.subscription,
      }
    case OperationType.UnsubscribeNotes:
      return {
        ...state,
        status: SubscriptionStatus.Idle,
        notes: [],
        subscription: null,
        fetchingPastNotes: false,
      }
    case OperationType.FetchPastNotesStart:
      return {
        ...state,
        fetchingPastNotes: true,
      }
    case OperationType.FetchPastNotesEnd:
      return {
        ...state,
        fetchingPastNotes: false,
        notes: [
          ...new Map(
            [...state.notes, ...action.notes].map((note) => [note.id, note])
          ).values(),
        ].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()),
      }
    case OperationType.AddNewNote:
      return {
        ...state,
        notes: state.notes.some((n) => n.id === action.note.id)
          ? state.notes
          : [...state.notes, action.note].sort(
              (a, b) => b.created_at.getTime() - a.created_at.getTime()
            ),
      }
  }
}

interface SubscriptionContextProps {
  status: SubscriptionStatus
  notes: Note[]
  error: Error | null
  subscription: { unsubscribe: () => void } | null
  fetchingPastNotes: boolean
  dispatch: Dispatch<SubscriptionAction>
}

export const SubscriptionContext = createContext<SubscriptionContextProps>({
  status: SubscriptionStatus.Idle,
  notes: [],
  error: null,
  subscription: null,
  fetchingPastNotes: false,
  dispatch: () => {},
})

export const SubscriptionProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState)

  const contextValue: SubscriptionContextProps = {
    status: state.status,
    notes: state.notes,
    error: state.error,
    subscription: state.subscription,
    fetchingPastNotes: state.fetchingPastNotes,
    dispatch,
  }

  return (
    <SubscriptionContext.Provider value={contextValue}>
      {children}
    </SubscriptionContext.Provider>
  )
}
