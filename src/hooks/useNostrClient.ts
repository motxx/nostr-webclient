import { useAtom } from 'jotai'
import { nostrClientAtom } from '@/state/atoms'
import { connectNostrClient } from '@/infrastructure/nostr/nostrClient'
import { useCallback, useMemo } from 'react'
import { ok } from 'neverthrow'

export const useNostrClient = () => {
  const [nostrClient, setNostrClient] = useAtom(nostrClientAtom)

  const refreshClient = useCallback(() => {
    if (nostrClient) {
      return nostrClient.disconnect().andThen(() => {
        setNostrClient(null)
        return connectNostrClient().andThen((client) => {
          setNostrClient(client)
          return ok(client)
        })
      })
    }
    return connectNostrClient().andThen((client) => {
      setNostrClient(client)
      return ok(client)
    })
  }, [nostrClient, setNostrClient])

  const isLoggedIn = useMemo(() => {
    return nostrClient?.isLoggedIn() ?? false
  }, [nostrClient])

  return {
    nostrClient,
    refreshClient,
    isLoggedIn,
  }
}
