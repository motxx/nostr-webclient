import React from 'react'

interface IconProps {
  className?: string
  icon: React.ReactElement
}

const Icon: React.FC<IconProps> = ({ className, icon }) => (
  <div className={className}>{icon}</div>
)

export default Icon
