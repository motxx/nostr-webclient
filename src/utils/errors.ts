type ErrorLike = Error | { [key: string]: any }

function isAggregateError(error: unknown): error is AggregateError {
  return (
    error instanceof AggregateError ||
    (typeof error === 'object' &&
      error !== null &&
      'errors' in error &&
      Array.isArray((error as any).errors))
  )
}

function flattenErrors(error: unknown): ErrorLike[] {
  if (isAggregateError(error)) {
    return (error.errors as unknown[]).flatMap(flattenErrors)
  } else if (Array.isArray(error)) {
    return error.flatMap(flattenErrors)
  } else if (
    error instanceof Error ||
    (typeof error === 'object' && error !== null)
  ) {
    return [error as ErrorLike]
  }
  return [new Error(String(error))]
}

function joinErrors(...errors: unknown[]): AggregateError {
  const flattenedErrors = errors.flatMap(flattenErrors)
  const messages = flattenedErrors.map((err) =>
    err instanceof Error
      ? err.message
      : typeof err === 'object' && err !== null && 'message' in err
        ? String(err.message)
        : String(err)
  )
  const joinedMessage = messages.join('; ')
  return new AggregateError(flattenedErrors, joinedMessage)
}

export { joinErrors }
