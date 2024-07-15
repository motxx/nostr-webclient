export type ExploreMetric =
  | 'engagement'
  | 'reposts'
  | 'likes'
  | 'zaps'
  | 'followers'
export type ExploreMetricWithNull = ExploreMetric | null

export type AccountFilter = 'global' | 'follows' | 'network'
