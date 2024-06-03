import React, { forwardRef } from 'react'
import classNames from 'classnames'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string
  onClick?: () => void
  children: React.ReactNode
  disabled?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, onClick, children, disabled }) => (
    <button
      className={classNames('p-2', className)}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
)

export default Button
