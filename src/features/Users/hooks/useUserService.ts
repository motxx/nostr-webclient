import { useState, useEffect, useCallback } from 'react'
import { UserService } from '@/infrastructure/services/UserService'
import { User } from '@/domain/entities/User'
import { useNostrClient } from '@/hooks/useNostrClient'

export const useUserService = () => {
  const nostrClient = useNostrClient()
  const [user, setUser] = useState<User | null>(null)
  const [userService, setUserService] = useState<UserService | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const connectUserService = async () => {
      if (nostrClient === null) return
      try {
        const userService = new UserService(nostrClient)
        const loggedInUser = await userService.login()
        setUser(loggedInUser)
        setUserService(userService)
        setIsConnected(true)
      } catch (error) {
        console.error(error)
      }
    }

    connectUserService()
  }, [nostrClient])

  const fetchUser = useCallback(async () => {
    if (!userService) return
    try {
      const fetchedUser = await userService.fetch()
      setUser(fetchedUser)
    } catch (error) {
      console.error(error)
    }
  }, [userService])

  return {
    user,
    isConnected,
    fetchUser,
  }
}
