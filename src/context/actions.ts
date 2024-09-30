import { Note } from '@/domain/entities/Note'
import { User } from '@/domain/entities/User'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'

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
      timeline: { unsubscribe: () => void }
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

export type AppAction = AuthAction | TimelineAction
