import React from 'react'
import { FiSearch } from 'react-icons/fi'
import Input from '../ui-elements/Input'

interface SearchInputProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  placeholder?: string
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchTerm,
  setSearchTerm,
  placeholder,
}) => (
  <div className="relative">
    <div className="flex items-center w-full px-2 border border-gray-200 dark:border-gray-700 rounded-full">
      <FiSearch className="text-gray-700 dark:text-gray-300 mr-2" />
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={placeholder || '検索...'}
        className="bg-transparent w-full text-sm text-gray-700 dark:text-gray-300"
      />
    </div>
  </div>
)

export default SearchInput
