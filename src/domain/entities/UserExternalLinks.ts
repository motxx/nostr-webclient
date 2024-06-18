export interface UserExternalLinksType {
  website?: string
  github?: string
  twitter?: string
  instagram?: string
  mastodon?: string
  telegram?: string
  bluesky?: string
  pixiv?: string
  skeb?: string
}

export class UserExternalLinks implements UserExternalLinksType {
  website?: string
  github?: string
  twitter?: string
  instagram?: string
  mastodon?: string
  telegram?: string
  bluesky?: string
  pixiv?: string
  skeb?: string

  constructor(data: UserExternalLinksType) {
    Object.assign(this, data)
  }
}
