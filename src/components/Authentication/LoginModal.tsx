import React, { useRef } from 'react'
import { FiLogIn } from 'react-icons/fi'
import { useClickAway } from 'react-use'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
  onLoginWithNsecApp: () => void
  onLoginWithExtension: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginWithNsecApp,
  onLoginWithExtension,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  useClickAway(modalRef, onClose)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 md:p-16 flex flex-col items-center"
      >
        <div
          className="z-10 absolute top-2 left-2 w-10 h-10 flex items-center justify-center text-white text-xl rounded-full hover:bg-gray-500 cursor-pointer hover:bg-opacity-25"
          onClick={onClose}
        >
          ✕
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4 md:mb-8 font-playlist-script">
          Nostragram
        </h1>

        <button
          className="w-full py-3 pl-8 pr-8 mb-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow transition-all duration-300 flex items-center justify-center"
          onClick={onLoginWithNsecApp}
        >
          <FiLogIn className="mr-2" />
          Nsec.appでログイン
        </button>

        <button
          className="w-full py-3 pl-8 pr-8 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-md shadow transition-all duration-300 flex items-center justify-center"
          onClick={onLoginWithExtension}
        >
          <FiLogIn className="mr-2" />
          拡張機能でログイン
        </button>
      </div>
    </div>
  )
}

export default LoginModal
