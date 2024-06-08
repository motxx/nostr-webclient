import { useState, useEffect, useCallback } from 'react'
import { UserService } from '@/infrastructure/services/UserService'
import { User } from '@/domain/entities/User'
import { UserSettings } from '@/domain/entities/UserSettings'

const userService = new UserService()

export const useUserService = () => {
  const [user, setUser] = useState<User | null>(null)
  const [settings, setSettings] = useState<UserSettings | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const connectUserService = async () => {
      try {
        const loggedInUser = await userService.login()
        setUser(loggedInUser)
        setSettings(loggedInUser.settings)
        setIsConnected(true)
      } catch (error) {
        console.error(error)
      }
    }

    connectUserService()
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const fetchedUser = await userService.fetch()
      setUser(fetchedUser)
    } catch (error) {
      console.error(error)
    }
  }, [])

  const updateUserSettings = useCallback(
    async (npub: string, newSettings: UserSettings) => {
      try {
        const updatedSettings = await userService.updateSettings(
          npub,
          newSettings
        )
        setSettings(updatedSettings)
      } catch (error) {
        console.error(error)
      }
    },
    []
  )

  const subscribeNWARequest = useCallback(
    (onNWARequest: (connectionUri: string) => void) => {
      try {
        userService.subscribeNWARequest(onNWARequest)
      } catch (error) {
        console.error(error)
      }
    },
    []
  )

  return {
    user,
    settings,
    isConnected,
    fetchUser,
    updateUserSettings,
    subscribeNWARequest,
  }
}
