import React from 'react'
import { useParams } from 'react-router-dom'
import TimelineLayout from '@/components/Timeline/TimelineLayout'
import Timeline from '@/components/Timeline/Timeline'

interface HashtagPageProps {
  focusBottomTab: () => void
  unfocusBottomTab: () => void
}

const HashtagPage: React.FC<HashtagPageProps> = ({
  focusBottomTab,
  unfocusBottomTab,
}) => {
  const { hashtag } = useParams<{ hashtag: string }>()

  return (
    <TimelineLayout>
      <Timeline
        onScrollUp={focusBottomTab}
        onScrollDown={unfocusBottomTab}
        hashtag={hashtag}
        showTabs={false}
      />
    </TimelineLayout>
  )
}

export default HashtagPage
