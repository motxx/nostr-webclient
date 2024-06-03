import React from 'react'
import Button from '@/components/ui-elements/Button'
import classNames from 'classnames'

interface TertiaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick: () => void
  children: React.ReactNode
  className?: string
}

const TertiaryButton: React.FC<TertiaryButtonProps> = ({
  children,
  onClick,
  className,
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      className={classNames(
        'bg-gray-800 hover:bg-gray-900 active:bg-gray-900 dark:bg-gray-800 hover:dark:bg-gray-900 active:dark:bg-gray-900 text-white font-semibold rounded-full shadow transition-all duration-300 flex items-center justify-center',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}

export default TertiaryButton
