import { useAtom } from 'jotai'
import { nostrClientAtom } from '@/state/atoms'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { useEffect } from 'react'

export const useNostrClient = () => {
  const [nostrClient, setNostrClient] = useAtom(nostrClientAtom)

  useEffect(() => {
    const initializeClient = async () => {
      if (!nostrClient) {
        const client = await NostrClient.connect()
        setNostrClient(client)
      }
    }

    initializeClient()
  }, [nostrClient, setNostrClient])

  return nostrClient
}
