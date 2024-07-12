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
          setNostrClient(result.value)
          setIsLoggedIn(result.value.isLoggedIn())
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

  const login = useCallback(() => {
    if (nostrClient) {
      nostrClient.setLoggedIn(true)
      setIsLoggedIn(true)
    }
  }, [nostrClient, setIsLoggedIn])

  const logout = useCallback(() => {
    if (nostrClient) {
      nostrClient.setLoggedIn(false)
      setIsLoggedIn(false)
    }
  }, [nostrClient, setIsLoggedIn])

  return {
    nostrClient,
    isLoggedIn,
    isLoading,
    error,
    login,
    logout,
    initializeClient,
  }
}
