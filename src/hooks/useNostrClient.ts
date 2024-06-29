import { useAtom } from 'jotai'
import { nostrClientAtom } from '@/state/atoms'
import { NostrClient } from '@/infrastructure/nostr/nostrClient'
import { useEffect } from 'react'

export const useNostrClient = () => {
  const [nostrClient, setNostrClient] = useAtom(nostrClientAtom)

  useEffect(() => {
    const initializeClient = async () => {
      if (!nostrClient) {
        const result = await NostrClient.connect()
        if (result.isOk()) {
          setNostrClient(result.value)
        } else {
          console.error(result.error)
        }
      }
    }

    initializeClient()
  }, [nostrClient, setNostrClient])

  return nostrClient
}
