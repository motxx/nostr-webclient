import { useMemo } from 'react'

export const useDateFormatting = () => {
  const formatDate = useMemo(
    () => (timestamp: string) => {
      const date = new Date(timestamp)
      return date.toLocaleDateString()
    },
    []
  )

  const isNewDay = useMemo(
    () => (currentMessage: any, previousMessage: any) => {
      const currentDate = formatDate(currentMessage.created_at.toISOString())
      const previousDate = previousMessage
        ? formatDate(previousMessage.created_at.toISOString())
        : null
      return currentDate !== previousDate
    },
    [formatDate]
  )

  return { formatDate, isNewDay }
}
