import React from 'react'
import PrimaryButton from '@/components/ui-parts/PrimaryButton'
import { init } from 'nostr-login'
import { useAuth } from '@/hooks/useAuth'
import { AuthStatus } from '@/state/auth'

const LoginPrompt: React.FC = () => {
  const { status, handleLogin } = useAuth()

  const openLoginModal = async () => {
    await init({ onAuth: handleLogin })
  }

  if (status === AuthStatus.LoggedIn) {
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
