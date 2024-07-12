import React, { useState } from 'react'
import LoginModal from '@/components/Authentication/LoginModal'
import PrimaryButton from '@/components/ui-parts/PrimaryButton'
import { isLoggedInAtom } from '@/state/atoms'
import { useAtom } from 'jotai'

const LoginPrompt: React.FC = () => {
  const [isLoggedIn] = useAtom(isLoggedInAtom)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false)

  const openLoginModal = () => setIsLoginModalOpen(true)
  const closeLoginModal = () => setIsLoginModalOpen(false)

  const handleLoginWithNsecApp = () => {
    // Open Nsec app
  }

  const handleLoginWithExtension = () => {
    // Open browser extension
  }

  const handleLoginWithImportingKeys = (nsecPrivateKey: string) => {
    // Import keys
  }

  const handleLogin = (method: () => void) => {
    method()
    closeLoginModal()
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
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginWithNsecApp={() => handleLogin(handleLoginWithNsecApp)}
        onLoginWithExtension={() => handleLogin(handleLoginWithExtension)}
        onLoginWithImportingKeys={(nsecPrivateKey: string) =>
          handleLogin(() => handleLoginWithImportingKeys(nsecPrivateKey))
        }
      />
    </>
  )
}

export default LoginPrompt
