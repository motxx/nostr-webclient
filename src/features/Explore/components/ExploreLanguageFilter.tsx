import React from 'react'

interface ExploreLanguageFilterProps {
  languageGroupFilter: string
  setLanguageGroupFilter: (language: string) => void
}

const ExploreLanguageFilter: React.FC<ExploreLanguageFilterProps> = ({
  languageGroupFilter,
  setLanguageGroupFilter,
}) => {
  const languageOptions = [
    { value: 'all', label: 'グローバル' },
    { value: 'english', label: '英語圏' },
    { value: 'japanese', label: '日本語' },
    { value: 'spanish', label: 'スペイン語圏' },
    { value: 'chinese', label: '中国語圏' },
    { value: 'hindi', label: 'ヒンディー語圏' },
    { value: 'arabic', label: 'アラビア語圏' },
    { value: 'portuguese', label: 'ポルトガル語圏' },
    { value: 'russian', label: 'ロシア語圏' },
    { value: 'french', label: 'フランス語圏' },
    { value: 'german', label: 'ドイツ語圏' },
  ]

  return (
    <div className="flex flex-wrap items-center">
      <label
        htmlFor="language-filter"
        className="mr-2 text-sm text-gray-700 dark:text-gray-300"
      >
        言語圏:
      </label>
      <select
        id="language-filter"
        value={languageGroupFilter}
        onChange={(e) => setLanguageGroupFilter(e.target.value)}
        className="p-1 bg-gray-200 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-full"
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ExploreLanguageFilter
