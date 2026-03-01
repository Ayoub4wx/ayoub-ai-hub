export interface YouTubeVideo {
  videoId: string
  title: string
  thumbnail: string
  publishedAt: string
  viewCount?: string
  url: string
  description?: string
}

export interface TikTokPost {
  url: string
  thumbnail: string
  title: string
  authorName: string
}

export interface InstagramPost {
  url: string
  thumbnail: string
  title: string
  authorName: string
  embedHtml?: string
  mediaUrl?: string
  caption?: string
  timestamp?: string
}
