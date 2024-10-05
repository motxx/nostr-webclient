export class UserFailedToConnectError extends AggregateError {
  constructor(details: Error) {
    super([details], 'User failed to connect')
  }
}

export class UserNotLoggedInError extends Error {
  constructor() {
    super('User not logged in')
  }
}

export class UserFailedToGetSettingsError extends AggregateError {
  constructor(details: Error) {
    super([details], 'User failed to get settings')
  }
}

export class UserFailedToUpdateSettingsError extends AggregateError {
  constructor(details: Error) {
    super([details], 'User failed to update settings')
  }
}

export class ContentFailedToGetError extends AggregateError {
  constructor(details: Error) {
    super([details], 'Content failed to get')
  }
}

export class ContentFailedToUpdateError extends AggregateError {
  constructor(details: Error) {
    super([details], 'Content failed to update')
  }
}

export class WalletNotInitializedError extends Error {
  constructor() {
    super('Wallet not initialized')
  }
}
