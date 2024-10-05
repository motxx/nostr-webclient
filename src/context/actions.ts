import { Conversation } from '@/domain/entities/Conversation'
import { DirectMessage } from '@/domain/entities/DirectMessage'
import { Note } from '@/domain/entities/Note'
import { User } from '@/domain/entities/User'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { Notification } from '@/domain/entities/Notification'

export enum OperationType {
  // Auth
  InitializeStart = 'InitializeStart',
  InitializeSuccess = 'InitializeSuccess',
  InitializeFailure = 'InitializeFailure',
  LoginSuccess = 'LoginSuccess',
  LoginFailure = 'LoginFailure',
  Logout = 'Logout',
  // Timeline
  SubscribeNotes = 'SubscribeNotes',
  SubscribeNotesError = 'SubscribeNotesError',
  UnsubscribeNotes = 'UnsubscribeNotes',
  FetchPastNotesStart = 'FetchPastNotesStart',
  FetchPastNotesEnd = 'FetchPastNotesEnd',
  FetchPastNotesError = 'FetchPastNotesError',
  AddNewNote = 'AddNewNote',
  // Messages
  SubscribeMessages = 'SubscribeMessages',
  SubscribeMessagesError = 'SubscribeMessagesError',
  AddNewMessage = 'AddNewMessage',
  SendMessage = 'SendMessage',
  SendMessageError = 'SendMessageError',
  CreateNewConversation = 'CreateNewConversation',
  CreateNewConversationError = 'CreateNewConversationError',
  UnsubscribeMessages = 'UnsubscribeMessages',
  // Notifications
  SubscribeNotifications = 'SubscribeNotifications',
  SubscribeNotificationsError = 'SubscribeNotificationsError',
  UnsubscribeNotifications = 'UnsubscribeNotifications',
  FetchPastNotificationsStart = 'FetchPastNotificationsStart',
  FetchPastNotificationsEnd = 'FetchPastNotificationsEnd',
  FetchPastNotificationsError = 'FetchPastNotificationsError',
  AddNewNotification = 'AddNewNotification',
}

export type AuthAction =
  | { type: OperationType.InitializeStart }
  | {
      type: OperationType.InitializeSuccess
      nostrClient: NostrClient
      readOnlyUser?: User
    }
  | { type: OperationType.InitializeFailure; error: Error }
  | { type: OperationType.LoginSuccess; user: User }
  | { type: OperationType.LoginFailure; error: Error }
  | { type: OperationType.Logout }

export type TimelineAction =
  | {
      type: OperationType.SubscribeNotes
    }
  | {
      type: OperationType.SubscribeNotesError
      error: Error
    }
  | {
      type: OperationType.FetchPastNotesStart
    }
  | {
      type: OperationType.FetchPastNotesEnd
      notes: Note[]
    }
  | {
      type: OperationType.FetchPastNotesError
      error: Error
    }
  | {
      type: OperationType.UnsubscribeNotes
    }
  | {
      type: OperationType.AddNewNote
      note: Note
    }

export type MessagesAction =
  | {
      type: OperationType.SubscribeMessages
    }
  | {
      type: OperationType.SubscribeMessagesError
      error: Error
    }
  | {
      type: OperationType.AddNewMessage
      // TODO: messageとconversationの包含関係を整理する
      conversation: Conversation
    }
  | {
      type: OperationType.SendMessage
      message: DirectMessage
    }
  | {
      type: OperationType.SendMessageError
      error: Error
    }
  | {
      type: OperationType.CreateNewConversation
      conversation: Conversation
    }
  | {
      type: OperationType.CreateNewConversationError
      error: Error
    }
  | {
      type: OperationType.UnsubscribeMessages
    }

export type NotificationsAction =
  | {
      type: OperationType.SubscribeNotifications
    }
  | {
      type: OperationType.SubscribeNotificationsError
      error: Error
    }
  | {
      type: OperationType.UnsubscribeNotifications
    }
  | {
      type: OperationType.FetchPastNotificationsStart
    }
  | {
      type: OperationType.FetchPastNotificationsEnd
      notifications: Notification[]
    }
  | {
      type: OperationType.FetchPastNotificationsError
      error: Error
    }
  | {
      type: OperationType.AddNewNotification
      notification: Notification
    }

export type AppAction =
  | AuthAction
  | TimelineAction
  | MessagesAction
  | NotificationsAction
