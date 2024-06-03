import React from 'react'
import TimelineStandard from '@/components/Timeline/TimelineStandard'
import TimelineImageGrid from '@/components/Timeline/TimelineImageGrid'
import ExploreUserInfluenceGraph from './ExploreUserInfluenceGraph'
import { ExploreMetricWithNull } from '../types'

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
        return (
          <div className="pt-4 sm:pt-8">
            <TimelineStandard posts={sortedPosts} />
          </div>
        )
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
