import React from 'react'
import TimelineLayout from '@/components/Timeline/TimelineLayout'
import Timeline from '@/components/Timeline/Timeline'
import { SubscriptionProvider } from '@/context/SubscriptionContext'

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
      <SubscriptionProvider>
        <Timeline
          onScrollUp={focusBottomTab}
          onScrollDown={unfocusBottomTab}
          onToggleFollow={toggleFollow}
          showTabs={true}
        />
      </SubscriptionProvider>
    </TimelineLayout>
  )
}

export default HomePage
