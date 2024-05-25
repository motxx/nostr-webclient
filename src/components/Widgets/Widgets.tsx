import React from 'react'
import Trends from './Trends'
import RecommendedUsers from './RecommendedUsers'
import RecommendedPublicChannel from './RecommendedPublicChannel'

const Widgets: React.FC = () => {
  return (
    <>
      <Trends />
      <RecommendedPublicChannel />
      <RecommendedUsers />
    </>
  )
}

export default Widgets
