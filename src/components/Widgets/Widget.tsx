import React from 'react'

interface WidgetProps {
  topic: string
  children: React.ReactNode
}

const Widget: React.FC<WidgetProps> = ({ topic, children }) => {
  return (
    <div>
      <div className="font-bold text-xl mb-4 text-gray-700 dark:text-gray-300 font-mplus-2">
        {topic}
      </div>
      <div>{children}</div>
    </div>
  )
}

export default Widget
