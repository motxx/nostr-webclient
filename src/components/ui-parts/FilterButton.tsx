import React from 'react'
import Button from '../ui-elements/Button'
import Icon from '../ui-elements/Icon'

interface FilterButtonProps {
  onClick: () => void
  active: boolean
  icon: React.ReactElement
  label?: string
  disabled?: boolean
}

const FilterButton: React.FC<FilterButtonProps> = ({
  onClick,
  active,
  icon,
  label,
  disabled,
}) => (
  <Button
    onClick={onClick}
    className={`p-2 flex items-center justify-center ${active ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'} rounded-full`}
    disabled={disabled}
  >
    <Icon icon={icon} />
    {label && <span className="ml-2">{label}</span>}
  </Button>
)

export default FilterButton