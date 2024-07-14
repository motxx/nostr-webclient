import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
  className?: string
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'blue-500',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-${color} ${sizeClasses[size]} ${className}`}
    ></div>
  )
}

export default Spinner
