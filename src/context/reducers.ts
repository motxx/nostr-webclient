import { AppState, NotificationsStatus } from './types'
import { AppAction, OperationType } from './actions'
import { AuthStatus, TimelineStatus, MessagesStatus } from './types'

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
    fetchingPastNotes: false,
  },
  messages: {
    status: MessagesStatus.Idle,
    conversations: [],
    temporaryMessages: [],
    error: null,
  },
  notifications: {
    status: NotificationsStatus.Idle,
    notifications: [],
    fetchingPastNotifications: false,
    error: null,
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
        },
      }
    case OperationType.AddNewNote:
      return {
        ...state,
        timeline: {
          ...state.timeline,
          notes: [
            ...new Map(
              [...state.timeline.notes, action.note].map((n) => [n.id, n])
            ).values(),
          ].sort((a, b) => b.created_at.getTime() - a.created_at.getTime()),
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
          status: TimelineStatus.Error,
          fetchingPastNotes: false,
          error: action.error,
        },
      }

    // Messages
    case OperationType.SubscribeMessages:
      return {
        ...state,
        messages: {
          ...state.messages,
          status: MessagesStatus.Subscribing,
        },
      }
    case OperationType.SubscribeMessagesError:
      return {
        ...state,
        messages: {
          ...state.messages,
          status: MessagesStatus.Error,
          error: action.error,
        },
      }
    case OperationType.UnsubscribeMessages:
      return {
        ...state,
        messages: {
          ...state.messages,
          status: MessagesStatus.Idle,
          conversations: [],
          temporaryMessages: [],
          error: null,
        },
      }
    case OperationType.AddNewMessage:
      return {
        ...state,
        messages: {
          ...state.messages,
          conversations: (() => {
            if (action.conversation.messages.length !== 1) {
              // TODO: 例外を実装せずに、Messageを受け取ってConversationにいれるという直感的なフローにする
              throw new Error(
                'conversations: Conversation does not have exactly one message.'
              )
            }
            const newMessage = action.conversation.messages[0]
            const existingConversation = state.messages.conversations.find(
              (conv) => conv.id === action.conversation.id
            )
            if (existingConversation) {
              return state.messages.conversations.map((conv) =>
                conv.id === action.conversation.id
                  ? conv.addMessage(newMessage)
                  : conv
              )
            }
            return [...state.messages.conversations, action.conversation]
          })(),
          temporaryMessages: (() => {
            if (action.conversation.messages.length !== 1) {
              // TODO: 同上
              throw new Error(
                'temporaryMessages: Conversation does not have exactly one message.'
              )
            }
            const newMessage = action.conversation.messages[0]
            return state.messages.temporaryMessages.filter(
              (msg) => msg.id !== newMessage.id
            )
          })(),
        },
      }
    case OperationType.SendMessage:
      return {
        ...state,
        messages: {
          ...state.messages,
          temporaryMessages: [
            ...state.messages.temporaryMessages,
            action.message,
          ],
        },
      }
    case OperationType.SendMessageError:
      return {
        ...state,
        messages: {
          ...state.messages,
          status: MessagesStatus.Error,
          error: action.error,
        },
      }
    case OperationType.CreateNewConversation:
      return {
        ...state,
        messages: {
          ...state.messages,
          conversations: [...state.messages.conversations, action.conversation],
        },
      }
    case OperationType.CreateNewConversationError:
      return {
        ...state,
        messages: {
          ...state.messages,
          status: MessagesStatus.Error,
          error: action.error,
        },
      }

    // Notifications
    case OperationType.SubscribeNotifications:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          status: NotificationsStatus.Subscribing,
        },
      }
    case OperationType.SubscribeNotificationsError:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          status: NotificationsStatus.Error,
          error: action.error,
        },
      }
    case OperationType.UnsubscribeNotifications:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          status: NotificationsStatus.Idle,
          fetchingPastNotifications: false,
          notifications: [],
          error: null,
        },
      }
    case OperationType.FetchPastNotificationsStart:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          fetchingPastNotifications: true,
        },
      }
    case OperationType.FetchPastNotificationsEnd:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          fetchingPastNotifications: false,
        },
      }
    case OperationType.FetchPastNotificationsError:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          status: NotificationsStatus.Error,
          fetchingPastNotifications: false,
          error: action.error,
        },
      }
    case OperationType.AddNewNotification:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          notifications: [
            ...new Map(
              [...state.notifications.notifications, action.notification].map(
                (n) => [n.id, n]
              )
            ).values(),
          ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        },
      }

    default:
      const check = (x: never): never => {
        throw new Error('unknown action: ' + x)
      }
      return check(action)
  }
}
