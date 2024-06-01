import React from 'react'
import TimelineStandard from '../Timeline/TimelineStandard'
import TimelineImageGrid from '../Timeline/TimelineImageGrid'
import ExploreUserInfluenceGraph from './ExploreUserInfluenceGraph'
import { ExploreMetricWithNull } from '../../pages/ExplorePage'

interface ExploreOutputProps {
  outputFormat: string
  sortedPosts: any[]
  metric: ExploreMetricWithNull
}

const ExploreOutput: React.FC<ExploreOutputProps> = ({
  outputFormat,
  sortedPosts,
  metric,
}) => {
  const renderOutput = () => {
    switch (outputFormat) {
      case 'timeline':
        return <TimelineStandard posts={sortedPosts} />
      case 'image-grid':
        return <TimelineImageGrid posts={sortedPosts} />
      case 'influence-map':
        return (
          <ExploreUserInfluenceGraph
            hashtags={[]}
            metric={metric || 'followers'}
          />
        )
      default:
        return null
    }
  }

  return <>{renderOutput()}</>
}

export default ExploreOutput
