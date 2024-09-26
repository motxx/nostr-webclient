import { useAtom } from 'jotai'
import { nostrClientAtom } from '@/state/atoms'
import { connectNostrClient } from '@/infrastructure/nostr/nostrClient'
import { ok } from 'neverthrow'
import { useCallback } from 'react'

export const useNostrClient = () => {
  const [nostrClient, setNostrClient] = useAtom(nostrClientAtom)

  const refreshClient = useCallback(() => {
    const connectClient = () =>
      connectNostrClient().andThen((client) => {
        setNostrClient(client)
        return ok(client)
      })

    if (nostrClient) {
      return nostrClient.disconnect().andThen(() => {
        setNostrClient(null)
        return connectClient()
      })
    }
    return connectClient()
  }, [nostrClient, setNostrClient])

  const isUserLoggedIn = useCallback(
    () => nostrClient?.isUserLoggedIn() ?? false,
    [nostrClient]
  )

  return {
    nostrClient,
    refreshClient,
    isUserLoggedIn,
  }
}
