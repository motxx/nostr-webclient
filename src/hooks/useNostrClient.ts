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
import { Mutex } from 'async-mutex'

export const useNostrClient = () => {
  const [nostrClient, setNostrClient] = useAtom(nostrClientAtom)
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom)
  const [loggedInUser, setLoggedInUser] = useAtom(loggedInUserAtom)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const initializeClient = useCallback(async () => {
    const mutex = new Mutex()
    await mutex.runExclusive(async () => {
      if (nostrClient || isLoggedIn) return

      console.log('initializeClient')

      setIsLoading(true)
      setError(null)

      const result = await getNostrClient()
      if (result.isErr()) {
        setError(result.error)
        return
      }

      const client = result.value
      setNostrClient(client)
      const loggedIn = client.isLoggedIn()
      setIsLoggedIn(loggedIn)

      if (!loggedIn) {
        setLoggedInUser(null)
        return
      }

      const userResult = client.getLoggedInUser()
      if (userResult.isErr()) {
        setError(userResult.error)
        return
      }

      const ndkUser = userResult.value
      const profileService = new UserProfileService(client)
      const profile = await profileService.fetchProfile(ndkUser.npub)
      const user = new User({
        npub: ndkUser.npub,
        pubkey: ndkUser.pubkey,
        profile: profile.isOk() ? profile.value : undefined,
      })
      setLoggedInUser(user)
    })
  }, [
    nostrClient,
    isLoggedIn,
    setIsLoggedIn,
    setError,
    setLoggedInUser,
    setNostrClient,
  ])

  useEffect(() => {
    initializeClient()
  }, [initializeClient])

  const refreshClient = useCallback(async () => {
    if (nostrClient) {
      const result = await nostrClient.disconnect()
      if (result.isOk()) {
        setNostrClient(null)
        setLoggedInUser(null)
        initializeClient()
      } else {
        setError(result.error)
      }
    }
  }, [nostrClient, setNostrClient, setLoggedInUser, initializeClient])

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
