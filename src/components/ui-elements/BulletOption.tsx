import React from 'react'

interface BulletOptionProps {
  id: string
  label: string
  selected: boolean
  onSelect: (item: string) => void
}

const BulletOption: React.FC<BulletOptionProps> = ({
  id,
  label,
  selected,
  onSelect,
}) => (
  <button
    onClick={() => onSelect(id)}
    className="flex items-center px-2 py-1 mr-2"
  >
    <span
      className={`w-4 h-4 rounded-full mr-2 ${selected ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
    ></span>
    <span className={selected ? 'font-semibold' : ''}>{label}</span>
  </button>
)

export default BulletOption
