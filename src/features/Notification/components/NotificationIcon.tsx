import React from 'react'
import Icon from '@/components/ui-elements/Icon'
import { FiRepeat } from 'react-icons/fi'
import { AiFillThunderbolt } from 'react-icons/ai'
import { BsHeartbreakFill, BsHeartFill } from 'react-icons/bs'

interface NotificationIconProps {
  type: string
  customReaction?: string
}

const NotificationIcon: React.FC<NotificationIconProps> = ({
  type,
  customReaction,
}) => {
  const iconMap: { [key: string]: React.ReactElement } = {
    like: <BsHeartFill />,
    dislike: <BsHeartbreakFill />,
    'custom-reaction': <BsHeartFill />,
    repost: <FiRepeat />,
    zap: <AiFillThunderbolt />,
  }

  const iconClassMap: { [key: string]: string } = {
    like: 'text-red-500 w-6 h-6',
    dislike: 'text-red-500 w-6 h-6',
    'custom-reaction': 'text-red-500 w-6 h-6',
    repost: 'text-green-500 w-6 h-6',
    zap: 'text-yellow-500 w-6 h-6',
  }

  return <Icon icon={iconMap[type]} className={iconClassMap[type]} />
}

export default NotificationIcon
