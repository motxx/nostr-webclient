import React from 'react'
import WidgetTrends from './WidgetTrends'
import WidgetRecommendedUsers from './WidgetRecommendedUsers'
import WidgetRecommendedPublicChannel from './WidgetRecommendedPublicChannel'

const Widgets: React.FC = () => {
  return (
    <div className="w-full px-6 py-2 space-y-10">
      <WidgetTrends />
      <WidgetRecommendedPublicChannel />
      <WidgetRecommendedUsers />
    </div>
  )
}

export default Widgets
