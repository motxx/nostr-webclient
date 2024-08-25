import React from 'react'
import PrimaryButton from '@/components/ui-parts/PrimaryButton'
import { isLoggedInAtom } from '@/state/atoms'
import { useAtom } from 'jotai'
import { init } from 'nostr-login'
import { useNostrClient } from '@/hooks/useNostrClient'

const LoginPrompt: React.FC = () => {
  const { refreshClient } = useNostrClient()
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom)

  const openLoginModal = async () => {
    await init({
      onAuth: () => {
        setIsLoggedIn(true)
        refreshClient()
      },
    })
  }

  if (isLoggedIn) {
    return null
  }

  return (
    <>
      <div className="flex items-center justify-between py-4">
        <p className="pl-2 sm:pl-4 text-gray-700 dark:text-gray-300 font-semibold font-mplus-2">
          ログインしてNostrを始めよう
        </p>
        <PrimaryButton className="py-2 px-4" onClick={openLoginModal}>
          ログイン
        </PrimaryButton>
      </div>
      <hr className="border-1 border-gray-200 dark:border-gray-700" />
    </>
  )
}

export default LoginPrompt
