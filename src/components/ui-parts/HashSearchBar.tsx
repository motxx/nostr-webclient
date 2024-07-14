import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { users } from '@/data/dummy-users'
import HashSearchInput from './HashSearchInput'

const HashSearchBar: React.FC<{
  onSearch: (term: string, tags: string[]) => void
}> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [hashtags, setHashtags] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (hashtags.length === 0 && searchTerm.length > 0) {
      const filteredUsers = users.filter(
        (user) =>
          user.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.userName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setSuggestions(filteredUsers)
    } else {
      setSuggestions([])
    }
  }, [searchTerm, hashtags.length])

  const handleSuggestionClick = (userId: string) => {
    navigate(`/user/${userId}`)
    setSearchTerm('')
    setHashtags([])
    setSuggestions([])
  }

  const handleSearchSubmit = () => {
    onSearch(searchTerm, hashtags)
    setSuggestions([])
  }

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    handleSearchSubmit()
  }

  return (
    <div className="relative">
      <form onSubmit={handleFormSubmit}>
        <HashSearchInput
          hashtags={hashtags}
          setHashtags={setHashtags}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="ユーザーまたはハッシュタグを検索..."
          className="w-full"
        />
        <button type="submit" className="hidden"></button>
      </form>
      {(searchTerm.length > 0 || hashtags.length > 0) && (
        <div className="absolute z-50 top-full left-0 w-full bg-white dark:bg-gray-800 mt-2 rounded-lg shadow-lg">
          <div
            onClick={handleSearchSubmit}
            className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-t-lg"
          >
            <div className="flex text-gray-800 dark:text-gray-200">
              {`「${searchTerm}${hashtags.length > 0 ? ' ' : ''}${hashtags.join(' ')}」を検索`}
            </div>
          </div>
          <hr className="border-gray-300 dark:border-gray-700" />
          <div className="pb-2">
            {suggestions.map((user) => (
              <div
                key={user.id}
                onClick={() => handleSuggestionClick(user.userId)}
                className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <img
                    src={user.image}
                    alt={user.userId}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <div>
                    <div className="text-gray-800 dark:text-gray-200 font-semibold">
                      {user.userName}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400 text-sm">
                      @{user.userId}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HashSearchBar
