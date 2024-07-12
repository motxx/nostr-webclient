import { useState, useEffect, useCallback } from 'react'
import { UserService } from '@/infrastructure/services/UserService'
import { User } from '@/domain/entities/User'
import { useNostrClient } from '@/hooks/useNostrClient'

export const useUserService = () => {
  const { nostrClient, login } = useNostrClient()
  const [user, setUser] = useState<User | null>(null)
  const [userService, setUserService] = useState<UserService | null>(null)

  useEffect(() => {
    const connectUserService = async () => {
      if (nostrClient === null) return
      const userService = new UserService(nostrClient)
      login()
      const loggedInUser = nostrClient.getLoggedInUser()
      if (loggedInUser.isOk()) {
        setUser(loggedInUser.value)
        setUserService(userService)
      }
    }

    connectUserService()
  }, [nostrClient, login])

  const fetchUser = useCallback(async () => {
    if (!userService) return
    const fetchedUser = userService.fetchLoggedInUser()
    if (fetchedUser.isOk()) {
      setUser(fetchedUser.value)
    }
  }, [userService])

  return {
    user,
    fetchUser,
  }
}
