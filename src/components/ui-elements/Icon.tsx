import React from 'react'

interface IconProps {
  className?: string
  icon: React.ReactElement
}

const Icon: React.FC<IconProps> = ({ className, icon }) => {
  return React.cloneElement(icon, { className })
}

export default Icon
