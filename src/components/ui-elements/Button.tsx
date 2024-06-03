import React from 'react'

interface ButtonProps {
  onClick: () => void
  className: string
  disabled?: boolean
  children: React.ReactNode
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  className,
  disabled = false,
  children,
}) => (
  <button onClick={onClick} className={className} disabled={disabled}>
    {children}
  </button>
)

export default Button
