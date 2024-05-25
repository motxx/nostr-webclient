import React, { useState, useRef } from 'react'
import { FiLogIn, FiKey } from 'react-icons/fi'
import { useClickAway } from 'react-use'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginWithNsecApp: () => void
  onLoginWithExtension: () => void
  onLoginWithImportingKeys: (key: string) => void
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginWithNsecApp,
  onLoginWithExtension,
  onLoginWithImportingKeys,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const [isImportingKey, setIsImportingKey] = useState(false)
  const [nsecPrivateKey, setNsecPrivateKey] = useState('')

  useClickAway(modalRef, () => {
    if (isImportingKey) {
      setIsImportingKey(false)
    } else {
      onClose()
    }
  })

  if (!isOpen) return null

  const handleLoginWithImportingKeys = () => {
    onLoginWithImportingKeys(nsecPrivateKey)
    onClose()
  }

  const renderLoginButtons = () => (
    <>
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 font-playlist-script">
        Nostragram
      </h1>

      <button
        className="w-full py-3 pl-8 pr-8 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center"
        onClick={onLoginWithNsecApp}
      >
        <FiLogIn className="mr-2" />
        Nsec.appでログイン
      </button>

      <button
        className="w-full py-3 pl-8 pr-8 mb-4 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center"
        onClick={onLoginWithExtension}
      >
        <FiLogIn className="mr-2" />
        拡張機能でログイン
      </button>

      <button
        className="w-full py-3 pl-8 pr-8 bg-gray-800 dark:bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center"
        onClick={() => setIsImportingKey(true)}
      >
        <FiKey className="mr-2" />
        秘密鍵をインポート
      </button>
    </>
  )

  const renderImportKeyField = () => (
    <div className="w-full flex flex-col items-center">
      <input
        type="text"
        placeholder="nsec..."
        value={nsecPrivateKey}
        onChange={(e) => setNsecPrivateKey(e.target.value)}
        className="min-w-[300px] w-full py-3 px-4 mb-4 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
      />
      <button
        className="w-full max-w-2/3 py-3 pl-8 pr-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center"
        onClick={handleLoginWithImportingKeys}
      >
        <FiLogIn className="mr-2" />
        ログイン
      </button>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-16 flex flex-col items-center justify-center w-full max-w-md mx-0 md:mx-auto min-h-52"
      >
        <div
          className="z-10 absolute top-2 right-2 w-10 h-10 flex items-center justify-center text-black dark:text-white text-xl rounded-full hover:bg-gray-500 cursor-pointer hover:bg-opacity-25"
          onClick={onClose}
        >
          ✕
        </div>

        {isImportingKey ? renderImportKeyField() : renderLoginButtons()}
      </div>
    </div>
  )
}

export default LoginModal
