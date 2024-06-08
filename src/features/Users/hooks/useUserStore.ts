import { useState, useEffect } from 'react'
import { UserStore } from '@/infrastructure/storage/UserStore'

export const useUserStore = (npub: string) => {
  const [userStore, setUserStore] = useState<UserStore | null>(null)

  useEffect(() => {
    const store = new UserStore(npub)
    setUserStore(store)
  }, [npub])

  const getUserSettings = (key: string) => {
    return userStore?.get(key)
  }

  const setUserSettings = (key: string, value: any) => {
    userStore?.set(key, value)
  }

  const removeUserSettings = (key: string) => {
    userStore?.remove(key)
  }

  return { getUserSettings, setUserSettings, removeUserSettings }
}
