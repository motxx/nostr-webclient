import { useAtom } from 'jotai'
import { nostrClientAtom, isLoggedInAtom } from '@/state/atoms'
import { getNostrClient } from '@/infrastructure/nostr/nostrClient'
import { useEffect, useState, useCallback } from 'react'

export const useNostrClient = () => {
  const [nostrClient, setNostrClient] = useAtom(nostrClientAtom)
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const initializeClient = useCallback(async () => {
    if (!nostrClient) {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getNostrClient()
        if (result.isOk()) {
          const nostrClient = result.value
          setNostrClient(nostrClient)
          setIsLoggedIn(nostrClient.isLoggedIn())
        } else {
          setError(result.error)
        }
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Unknown error occurred'))
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(false)
    }
  }, [nostrClient, setNostrClient, setIsLoggedIn])

  useEffect(() => {
    initializeClient()
  }, [initializeClient])

  const refreshClient = useCallback(async () => {
    if (nostrClient) {
      const result = await nostrClient.disconnect()
      if (result.isOk()) {
        setNostrClient(null)
        initializeClient()
      } else {
        setError(result.error)
      }
    }
  }, [nostrClient, setNostrClient, initializeClient])

  return {
    nostrClient,
    isLoggedIn,
    isLoading,
    error,
    initializeClient,
    refreshClient,
  }
}
