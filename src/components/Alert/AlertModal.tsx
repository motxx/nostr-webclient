import React, { useRef } from 'react'
import PrimaryButton from '../ui-parts/PrimaryButton'
import { useClickAway } from 'react-use'

interface AlertModalProps {
  show: boolean
  title: string
  message?: string
  textarea?: boolean
  textareaContent?: string
  onClose: () => void
}

const AlertModal: React.FC<AlertModalProps> = ({
  show,
  title,
  message,
  textarea = false,
  textareaContent = '',
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useClickAway(modalRef, onClose)

  if (!show) {
    return null
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden max-w-2xl"
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <div className="p-4">
          {message && <p className="mb-4 text-sm">{message}</p>}
          {textarea && (
            <textarea
              value={textareaContent}
              readOnly
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-sm"
              rows={8}
            />
          )}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-center">
          <PrimaryButton
            onClick={onClose}
            className="px-[10%] text-sm rounded-lg"
          >
            OK
          </PrimaryButton>
        </div>
      </div>
    </div>
  )
}

export default AlertModal
