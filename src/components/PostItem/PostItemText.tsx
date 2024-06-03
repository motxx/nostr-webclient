import { useState } from 'react'
import { TextConverter } from '../functional/TextConverter'

interface PostItemTextProps {
  text: string
}

const PostItemText: React.FC<PostItemTextProps> = ({ text }) => {
  const [showMore, setShowMore] = useState(false)
  const toggleShowMore = () => setShowMore(!showMore)

  return (
    <div className="text-sm text-gray-700 dark:text-gray-300 font-noto-sans">
      <TextConverter text={showMore ? text : text.substring(0, 100)} />
      {text.length > 100 && (
        <span>
          {!showMore && <span>...</span>}
          <button
            onClick={toggleShowMore}
            className="text-blue-500 dark:text-blue-300 ml-2"
          >
            {showMore ? '閉じる' : '続きを読む'}
          </button>
        </span>
      )}
    </div>
  )
}

export default PostItemText
