import React, { useState } from 'react'
import LoginModal from '../Authentication/LoginModal'
import PrimaryButton from '../common/PrimaryButton'
import { isLoggedInAtom } from '../../state/atoms'
import { useAtom } from 'jotai'

const LoginPrompt: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useAtom(isLoggedInAtom)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false)
  const openLoginModal = () => setIsLoginModalOpen(true)
  const closeLoginModal = () => setIsLoginModalOpen(false)

  const handleLoginWithNsecApp = () => {
    // ログイン処理を追加
    setIsLoggedIn(true)
    closeLoginModal()
  }

  const handleLoginWithExtension = () => {
    // ログイン処理を追加
    setIsLoggedIn(true)
    closeLoginModal()
  }

  const handleLoginWithImportingKeys = (nsecPrivateKey: string) => {
    // ログイン処理を追加
    setIsLoggedIn(true)
    closeLoginModal()
  }

  if (isLoggedIn) {
    return null
  }

  return (
    <>
      <div className="flex flex-row items-center justify-between py-4">
        <div className="pl-2 sm:pl-4 text-gray-700 dark:text-gray-300 font-semibold font-mplus-2">
          <p>ログインしてNostrを始めよう</p>
        </div>
        <div className="pr-2 sm:pr-4">
          <PrimaryButton className="py-2 px-4" onClick={openLoginModal}>
            ログイン
          </PrimaryButton>
        </div>
      </div>
      <hr className="border-1 border-gray-200 dark:border-gray-700" />
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={closeLoginModal}
        onLoginWithNsecApp={handleLoginWithNsecApp}
        onLoginWithExtension={handleLoginWithExtension}
        onLoginWithImportingKeys={handleLoginWithImportingKeys}
      />
    </>
  )
}

export default LoginPrompt
