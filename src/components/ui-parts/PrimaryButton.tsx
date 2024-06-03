import React from 'react'
import Button from '../ui-elements/Button'
import classNames from 'classnames'

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
  children: React.ReactNode
  className?: string
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  className,
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      className={classNames(
        'bg-blue-500 hover:bg-blue-600 active:bg-blue-700 dark:bg-blue-600 hover:dark:bg-blue-700 active:dark:bg-blue-800 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export default PrimaryButton
