export type TimelineTabId = 'following' | 'recommended' | 'images' | 'clips'
export type TimelineFeedType = 'standard' | 'image-grid' | 'video-swipe'
export type TimelineTabType = {
  id: TimelineTabId
  feedType: TimelineFeedType
  name: string
}

export const HomeTimelineTabs: TimelineTabType[] = [
  { id: 'following', feedType: 'standard', name: 'フォロー中' },
  { id: 'recommended', feedType: 'standard', name: 'おすすめ' },
  { id: 'images', feedType: 'image-grid', name: 'ピクチャー' },
  { id: 'clips', feedType: 'video-swipe', name: 'クリップ' },
]
