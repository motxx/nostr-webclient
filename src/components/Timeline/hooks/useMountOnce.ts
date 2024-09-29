import { useEffect, useRef } from 'react'

export const useMountOnce = (onMount: () => void) => {
  const isExecutedRef = useRef(false)

  const onMountRef = useRef(onMount)
  onMountRef.current = onMount

  useEffect(() => {
    if (isExecutedRef.current) {
      return
    }

    onMountRef.current()
    isExecutedRef.current = true
  }, [])
}
