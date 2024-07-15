import { PublicChannel } from '@/domain/entities/PublicChat'

export const PublicChatMessageWindowHeader: React.FC<{
  channel: PublicChannel
  onOpenSidebar: () => void
}> = ({ channel, onOpenSidebar }) => (
  <div className="z-10 sticky top-0 w-full">
    <div className="absolute inset-0 bg-gradient-to-b from-white/80 to-transparent dark:from-black/80 backdrop-blur-sm" />
    <div className="relative flex">
      <button
        onClick={onOpenSidebar}
        className="md:hidden w-8 h-12 px-4 py-5 font-bold"
      >
        ←
      </button>
      <h2 className="text-lg font-bold mb-4 px-2 md:px-4 pt-8 pb-4 h-12 flex items-center">
        {channel ? `# ${channel.name}` : 'Select a channel'}
      </h2>
    </div>
  </div>
)
