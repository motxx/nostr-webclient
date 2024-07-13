import { useAtom } from 'jotai'
import {
  nostrClientAtom,
  isLoggedInAtom,
  loggedInUserAtom,
} from '@/state/atoms'
import { getNostrClient } from '@/infrastructure/nostr/nostrClient'
import { useEffect, useState, useCallback } from 'react'
import { User } from '@/domain/entities/User'
import { UserProfileService } from '@/infrastructure/services/UserProfileService'

export const useNostrClient = () => {
  const [nostrClient, setNostrClient] = useAtom(nostrClientAtom)
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom)
  const [loggedInUser, setLoggedInUser] = useAtom(loggedInUserAtom)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const initializeClient = useCallback(async () => {
    if (!nostrClient) {
      setIsLoading(true)
      setError(null)
      try {
        const result = await getNostrClient()
        if (result.isOk()) {
          const client = result.value
          setNostrClient(client)
          const isLoggedIn = client.isLoggedIn()
          setIsLoggedIn(isLoggedIn)

          if (isLoggedIn) {
            const userResult = client.getLoggedInUser()
            if (userResult.isOk()) {
              const ndkUser = userResult.value
              const profileService = new UserProfileService(client)
              const profile = await profileService.fetchProfile(ndkUser.npub)
              const user = new User({
                npub: ndkUser.npub,
                pubkey: ndkUser.pubkey,
                profile: profile.isOk() ? profile.value : undefined,
              })
              setLoggedInUser(user)
            } else {
              setError(userResult.error)
            }
          } else {
            setLoggedInUser(null)
          }
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
  }, [nostrClient, setNostrClient, setIsLoggedIn, setLoggedInUser])

  useEffect(() => {
    initializeClient()
  }, [initializeClient])

  const refreshClient = useCallback(async () => {
    if (nostrClient) {
      const result = await nostrClient.disconnect()
      if (result.isOk()) {
        setNostrClient(null)
        setIsLoggedIn(false)
        setLoggedInUser(null)
        initializeClient()
      } else {
        setError(result.error)
      }
    }
  }, [
    nostrClient,
    setNostrClient,
    setIsLoggedIn,
    setLoggedInUser,
    initializeClient,
  ])

  return {
    nostrClient,
    isLoggedIn,
    loggedInUser,
    isLoading,
    error,
    initializeClient,
    refreshClient,
  }
}
