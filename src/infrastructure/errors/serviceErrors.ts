import { ErrorWithDetails } from '@/infrastructure/errors/ErrorWithDetails'

export class UserFailedToConnectError extends ErrorWithDetails {
  constructor(details: Error) {
    super('User failed to connect', details)
  }
}

export class UserNotLoggedInError extends Error {
  constructor() {
    super('User not logged in')
  }
}

export class UserFailedToGetSettingsError extends ErrorWithDetails {
  constructor(details: Error) {
    super('User failed to get settings', details)
  }
}

export class UserFailedToUpdateSettingsError extends ErrorWithDetails {
  constructor(details: Error) {
    super('User failed to update settings', details)
  }
}

export class ContentFailedToGetError extends ErrorWithDetails {
  constructor(details: Error) {
    super('Content failed to get', details)
  }
}

export class ContentFailedToUpdateError extends ErrorWithDetails {
  constructor(details: Error) {
    super('Content failed to update', details)
  }
}

export class WalletNotInitializedError extends Error {
  constructor() {
    super('Wallet not initialized')
  }
}
