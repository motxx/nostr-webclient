import { AppState } from './types'
import { AppAction, OperationType } from './actions'
import { AuthStatus, TimelineStatus } from './types'

export const initialState: AppState = {
  auth: {
    status: AuthStatus.Idle,
    loggedInUser: null,
    readOnlyUser: null,
    nostrClient: null,
    error: null,
  },
  timeline: {
    status: TimelineStatus.Idle,
    notes: [],
    error: null,
    timeline: null,
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

    // Timeline
    case OperationType.SubscribeNotes:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          status: TimelineStatus.Subscribing,
          timeline: action.timeline,
        },
      }
    case OperationType.UnsubscribeNotes:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          status: TimelineStatus.Idle,
          notes: [],
          error: null,
          timeline: null,
          fetchingPastNotes: false,
        },
      }
    case OperationType.FetchPastNotesStart:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          fetchingPastNotes: true,
        },
      }
    case OperationType.FetchPastNotesEnd:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          fetchingPastNotes: false,
          notes: [
            ...new Map(
              [...state.timeline.notes, ...action.notes].map((note) => [
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
        timeline: {
          ...state.timeline,
          notes: state.timeline.notes.some((n) => n.id === action.note.id)
            ? state.timeline.notes
            : [...state.timeline.notes, action.note].sort(
                (a, b) => b.created_at.getTime() - a.created_at.getTime()
              ),
        },
      }
    case OperationType.SubscribeNotesError:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          status: TimelineStatus.Error,
          error: action.error,
        },
      }
    case OperationType.FetchPastNotesError:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          fetchingPastNotes: false,
          error: action.error,
        },
      }

    default:
      return state
  }
}
