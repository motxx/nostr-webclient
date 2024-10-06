import { LnurlPay } from '@/infrastructure/nostr/lnurlPay'

export class NostrNoWindowNostrError extends Error {
  constructor() {
    super('No window.nostr(NIP-07) found.')
  }
}

export class NostrClientConnectError extends AggregateError {
  constructor(details: Error) {
    super([details], 'Failed to connect NostrClient')
  }
}

export class NostrClientAlreadyConnected extends Error {
  constructor() {
    super('NostrClient already connected')
  }
}

export class NostrNWCNotInitializedError extends Error {
  constructor() {
    super('nwc is not initialized.')
  }
}

export class NostrUnknownUserError extends Error {
  constructor(userAddress: string) {
    super(`Unknown user. userAddress:${userAddress}`)
  }
}

export class NostrRequestLnurlPayError extends Error {
  constructor(metadata: any, details: Error) {
    super(
      `Failed to request LNURL-Pay. metadata:${JSON.stringify(metadata)} details:${details}`
    )
  }
}

export class NostrGetZapEndpointCallbackUrlError extends Error {
  constructor(lnurlPay: LnurlPay) {
    super(
      `Failed to get zap endpoint callback url. lnurlPay:${JSON.stringify(lnurlPay)}`
    )
  }
}

export class NostrMinSendableConstraintError extends Error {
  constructor(amount: number, minSendable?: number) {
    super(
      `Amount too small. amount:${amount} minSendable:${minSendable ?? '(undefined)'}`
    )
  }
}

export class NostrMaxSendableConstraintError extends Error {
  constructor(amount: number, maxSendable?: number) {
    super(
      `Amount too large. amount:${amount} maxSendable:${maxSendable ?? '(undefined)'}`
    )
  }
}

export class NostrCallZapEndpointError extends Error {
  constructor(response: any) {
    super(`Failed to call zap endpoint. response:${JSON.stringify(response)}`)
  }
}

export class NostrInvoiceNotFoundError extends Error {
  constructor(response: any) {
    super(`Invoice not found. response:${JSON.stringify(response)}`)
  }
}

export class NostrReadOnlyError extends Error {
  constructor() {
    super('Read-only account. Write forbidden.')
  }
}
