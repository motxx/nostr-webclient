import React from 'react'
import TimelineStandard from '@/components/Timeline/TimelineStandard'
import TimelineImageGrid from '@/components/Timeline/TimelineImageGrid'
import ExploreUserInfluenceGraph from './ExploreUserInfluenceGraph'
import { ExploreMetricWithNull } from '../types'
import { Note } from '@/domain/entities/Note'

interface ExploreOutputProps {
  outputFormat: string
  sortedNotes: Note[]
  metric: ExploreMetricWithNull
}

const ExploreOutput: React.FC<ExploreOutputProps> = ({
  outputFormat,
  sortedNotes,
  metric,
}) => {
  const renderOutput = () => {
    switch (outputFormat) {
      case 'timeline':
        return (
          <div className="pt-4 sm:pt-8">
            <TimelineStandard
              notes={sortedNotes}
              onToggleFollow={() => {
                return true
              }}
            />
          </div>
        )
      case 'image-grid':
        return <TimelineImageGrid notes={sortedNotes} />
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
