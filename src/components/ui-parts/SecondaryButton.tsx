import React from 'react'
import Button from '../ui-elements/Button'
import classNames from 'classnames'

interface SecondaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
  children: React.ReactNode
  className?: string
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  onClick,
  className,
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      className={classNames(
        'bg-yellow-500 hover:bg-yellow-600 active:bg-yellow-700 dark:bg-yellow-600 hover:dark:bg-yellow-700 active:dark:bg-yellow-800 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export default SecondaryButton
