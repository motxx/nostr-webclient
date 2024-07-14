import React, { useRef } from 'react'
import { FiSearch } from 'react-icons/fi'
import classNames from 'classnames'

interface SearchInputProps {
  searchTerm: string
  setSearchTerm: (term: string) => void
  hashtags: string[]
  setHashtags: (tags: string[]) => void
  placeholder?: string
  className?: string
}

const HashSearchInput: React.FC<SearchInputProps> = ({
  searchTerm,
  setSearchTerm,
  hashtags,
  setHashtags,
  placeholder,
  className,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === 'Backspace' &&
      hashtags.length > 0 &&
      e.currentTarget.selectionStart === 0
    ) {
      e.preventDefault()
      const newHashtags = hashtags.slice(0, -1)
      setHashtags(newHashtags)
      return
    }

    if (e.key !== 'Enter' && e.key !== ' ') {
      return
    }

    const words = searchTerm.split(' ')
    const lastWord = words[words.length - 1]
    if (lastWord.startsWith('#') && lastWord.length > 1) {
      if (!hashtags.includes(lastWord)) {
        const newHashtags = [...hashtags, lastWord]
        setHashtags(newHashtags)
      }
      const newSearchTerm = searchTerm.replace(lastWord, '').trim()
      setSearchTerm(newSearchTerm)
    } else {
      const newSearchTerm = searchTerm.trim()
      setSearchTerm(newSearchTerm)
    }
  }

  const handleHashtagClick = (hashtag: string) => {
    const newSearchTerm = searchTerm.replace(hashtag, '').trim()
    setSearchTerm(newSearchTerm)
    setHashtags(hashtags.filter((tag) => tag !== hashtag))
  }

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  return (
    <div className={classNames('relative', className)}>
      <div
        className="flex items-center w-full h-10 px-3 border border-gray-200 dark:border-gray-700 rounded-full bg-white dark:bg-gray-800 overflow-hidden"
        onClick={focusInput}
      >
        <FiSearch className="text-gray-700 dark:text-gray-300 mr-2 flex-shrink-0" />
        <div className="flex-grow flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
          {hashtags.map((tag, index) => (
            <span
              key={index}
              className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs mr-1 cursor-pointer flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                handleHashtagClick(tag)
              }}
            >
              {tag}
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={hashtags.length > 0 ? '' : placeholder || '検索...'}
            className="bg-transparent min-w-0 flex-grow text-sm text-gray-700 dark:text-gray-300 outline-none placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>
    </div>
  )
}

export default HashSearchInput
