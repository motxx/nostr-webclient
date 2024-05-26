import React from 'react'
import { FiSearch } from 'react-icons/fi'

const SearchBar: React.FC = () => {
  return (
    <div className="flex items-center bg-gray-200 dark:bg-gray-700 p-2 rounded-full">
      <FiSearch className="text-gray-700 dark:text-gray-300 mr-2" />
      <input
        type="text"
        placeholder="検索"
        className="bg-transparent outline-none w-full text-gray-700 dark:text-gray-300 text-sm"
      />
    </div>
  )
}

export default SearchBar
