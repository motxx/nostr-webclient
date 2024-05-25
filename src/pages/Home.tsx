import LoginPrompt from '../components/Timeline/LoginPrompt'
import Timeline from '../components/Timeline/Timeline'
import Widgets from '../components/Widgets/Widgets'

interface HomeProps {
  focusBottomTab: () => void
  unfocusBottomTab: () => void
  toggleFollow: (userId: string) => boolean
}

const Home: React.FC<HomeProps> = ({
  focusBottomTab,
  unfocusBottomTab,
  toggleFollow,
}) => {
  return (
    <div className="flex justify-center">
      <div className="flex flex-col w-full max-w-2xl h-screen overflow-y-auto hide-scrollbar">
        <LoginPrompt />
        <Timeline
          onScrollUp={focusBottomTab}
          onScrollDown={unfocusBottomTab}
          onToggleFollow={toggleFollow}
        />
      </div>
      <div
        className="hidden py-4 lg:flex flex-col w-1/3 min-w-[280px] max-w-[500px] ml-4 space-y-4 overflow-y-auto hide-scrollbar"
        style={{ maxHeight: '100vh' }}
      >
        <Widgets />
      </div>
    </div>
  )
}

export default Home
