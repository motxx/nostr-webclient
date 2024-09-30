import { AppState } from './types'
import { AppAction, OperationType } from './actions'
import { AuthStatus, SubscriptionStatus } from './types'

export const initialState: AppState = {
  auth: {
    status: AuthStatus.Idle,
    loggedInUser: null,
    readOnlyUser: null,
    nostrClient: null,
    error: null,
  },
  subscription: {
    status: SubscriptionStatus.Idle,
    notes: [],
    error: null,
    subscription: null,
    fetchingPastNotes: false,
  },
  dispatch: () => {},
}

export const appReducer = (state: AppState, action: AppAction): AppState => {
  console.log('action', action)
  switch (action.type) {
    // Login Auth
    case OperationType.InitializeStart:
      return {
        ...state,
        auth: {
          ...state.auth,
          status: AuthStatus.Initializing,
          nostrClient: null,
          loggedInUser: null,
          readOnlyUser: null,
          error: null,
        },
      }
    case OperationType.InitializeSuccess:
      return {
        ...state,
        auth: {
          ...state.auth,
          status: AuthStatus.ClientReady,
          nostrClient: action.nostrClient,
          readOnlyUser: action.readOnlyUser ?? null,
        },
      }
    case OperationType.InitializeFailure:
      return {
        ...state,
        auth: {
          ...state.auth,
          status: AuthStatus.Error,
          error: action.error,
        },
      }
    case OperationType.LoginSuccess:
      return {
        ...state,
        auth: {
          ...state.auth,
          status: AuthStatus.LoggedIn,
          loggedInUser: action.user,
        },
      }
    case OperationType.LoginFailure:
      return {
        ...state,
        auth: {
          ...state.auth,
          status: AuthStatus.Error,
          error: action.error,
        },
      }
    case OperationType.Logout:
      return {
        ...state,
        auth: {
          ...state.auth,
          status: AuthStatus.Idle,
          loggedInUser: null,
          nostrClient: null,
          error: null,
        },
      }

    // Subscriptions
    case OperationType.SubscribeNotes:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          status: SubscriptionStatus.Subscribing,
          subscription: action.subscription,
        },
      }
    case OperationType.UnsubscribeNotes:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          status: SubscriptionStatus.Idle,
          notes: [],
          error: null,
          subscription: null,
          fetchingPastNotes: false,
        },
      }
    case OperationType.FetchPastNotesStart:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          fetchingPastNotes: true,
        },
      }
    case OperationType.FetchPastNotesEnd:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          fetchingPastNotes: false,
          notes: [
            ...new Map(
              [...state.subscription.notes, ...action.notes].map((note) => [
                note.id,
                note,
              ])
            ).values(),
          ].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()),
        },
      }
    case OperationType.AddNewNote:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          notes: state.subscription.notes.some((n) => n.id === action.note.id)
            ? state.subscription.notes
            : [...state.subscription.notes, action.note].sort(
                (a, b) => b.created_at.getTime() - a.created_at.getTime()
              ),
        },
      }
    case OperationType.SubscriptionError:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          status: SubscriptionStatus.Error,
          error: action.error,
        },
      }
    case OperationType.FetchPastNotesError:
      return {
        ...state,
        subscription: {
          ...state.subscription,
          fetchingPastNotes: false,
          error: action.error,
        },
      }

    default:
      return state
  }
}
