import React from 'react'
import TimelineLayout from '@/components/Timeline/TimelineLayout'
import Timeline from '@/components/Timeline/Timeline'

interface HomePageProps {
  focusBottomTab: () => void
  unfocusBottomTab: () => void
}

const HomePage: React.FC<HomePageProps> = ({
  focusBottomTab,
  unfocusBottomTab,
}) => {
  return (
    <TimelineLayout>
      <Timeline
        onScrollUp={focusBottomTab}
        onScrollDown={unfocusBottomTab}
        showTabs={true}
      />
    </TimelineLayout>
  )
}

export default HomePage
