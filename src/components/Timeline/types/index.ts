export type TimelineTabId = 'following' | 'images' | 'clips'
export type TimelineFeedType = 'standard' | 'image-grid' | 'video-swipe'
export type TimelineTabType = {
  id: TimelineTabId
  feedType: TimelineFeedType
  name: string
}

export const HomeTimelineTabs: TimelineTabType[] = [
  { id: 'following', feedType: 'standard', name: 'フォロー中' },
  { id: 'images', feedType: 'image-grid', name: 'ピクチャー' },
  { id: 'clips', feedType: 'video-swipe', name: 'クリップ' },
]

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}
