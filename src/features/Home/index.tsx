import React from 'react'
import TimelineLayout from '@/components/Timeline/TimelineLayout'
import Timeline from '@/components/Timeline/Timeline'

interface HomePageProps {
  focusBottomTab: () => void
  unfocusBottomTab: () => void
  toggleFollow: (userId: string) => boolean
}

const HomePage: React.FC<HomePageProps> = ({
  focusBottomTab,
  unfocusBottomTab,
  toggleFollow,
}) => {
  return (
    <TimelineLayout>
      <Timeline
        onScrollUp={focusBottomTab}
        onScrollDown={unfocusBottomTab}
        onToggleFollow={toggleFollow}
        showTabs={true}
      />
    </TimelineLayout>
  )
}

export default HomePage
