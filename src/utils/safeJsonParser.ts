import { Result } from 'neverthrow'

type ParseError = { message: string }
const toParseError = (error: unknown, json: string): ParseError => ({
  message: `Parse Error. json: ${json}, error: ${error}`,
})
export const safeJsonParse = (json: string): Result<any, ParseError> =>
  Result.fromThrowable(JSON.parse, (error) => toParseError(error, json))(json)
