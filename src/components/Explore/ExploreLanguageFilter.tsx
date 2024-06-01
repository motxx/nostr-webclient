import React from 'react'

interface ExploreLanguageFilterProps {
  languageGroupFilter: string
  setLanguageGroupFilter: (language: string) => void
}

const ExploreLanguageFilter: React.FC<ExploreLanguageFilterProps> = ({
  languageGroupFilter,
  setLanguageGroupFilter,
}) => {
  return (
    <div className="flex flex-wrap items-center">
      <label className="mr-2 text-sm text-gray-700 dark:text-gray-300">
        言語圏:
      </label>
      <select
        value={languageGroupFilter}
        onChange={(e) => setLanguageGroupFilter(e.target.value)}
        className="p-1 bg-gray-200 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-300 rounded-full"
      >
        <option value="all">グローバル</option>
        <option value="english">英語圏</option>
        <option value="japanese">日本語</option>
        <option value="spanish">スペイン語圏</option>
        <option value="chinese">中国語圏</option>
        <option value="hindi">ヒンディー語圏</option>
        <option value="arabic">アラビア語圏</option>
        <option value="portuguese">ポルトガル語圏</option>
        <option value="russian">ロシア語圏</option>
        <option value="french">フランス語圏</option>
        <option value="german">ドイツ語圏</option>
        {/* Add more language groups as needed */}
      </select>
    </div>
  )
}

export default ExploreLanguageFilter
