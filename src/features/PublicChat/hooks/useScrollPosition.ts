import { useEffect } from 'react'

export const useScrollPosition = (
  ref: React.RefObject<HTMLDivElement>,
  channelId: string,
  scrollPositions: Record<string, number>,
  setScrollPositions: (value: Record<string, number>) => void
) => {
  useEffect(() => {
    if (ref.current) {
      const savedScrollPosition = scrollPositions[channelId]
      ref.current.scrollTop = savedScrollPosition ?? 0
    }
  }, [channelId, scrollPositions, ref])

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const { scrollTop } = ref.current
        setScrollPositions((prev) => ({
          ...prev,
          [channelId]: scrollTop,
        }))
      }
    }

    const element = ref.current
    element?.addEventListener('scroll', handleScroll)

    return () => {
      element?.removeEventListener('scroll', handleScroll)
    }
  }, [channelId, setScrollPositions, ref])
}
