import { useEffect, useRef } from 'react'

export const useUnmountOnce = (onUnmount: () => void) => {
  const timerIdRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const onUnmountRef = useRef(onUnmount)
  onUnmountRef.current = onUnmount

  useEffect(() => {
    clearTimeout(timerIdRef.current)

    return () => {
      timerIdRef.current = setTimeout(() => {
        onUnmountRef.current()
      }, 0)
    }
  }, [])
}
