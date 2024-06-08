export class ErrorWithDetails extends Error {
  constructor(
    message: string,
    public details: Error
  ) {
    super(`${message}: ${details.message}`)
  }
}
