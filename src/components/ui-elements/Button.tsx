import React from 'react'
import classNames from 'classnames'

interface ButtonProps {
  className?: string
  onClick?: () => void
  children: React.ReactNode
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({
  className,
  onClick,
  children,
  disabled,
}) => (
  <button
    className={classNames('p-2', className)}
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </button>
)

export default Button
