export interface NewsArticle {
  id: string
  title: string
  summary: string
  url: string
  source: string
  sourceId: string
  publishedAt: string
  imageUrl?: string
  author?: string
  categories?: string[]
}

export interface RSSFeedConfig {
  id: string
  name: string
  url: string
  color: string
}

export type NewsSort = 'date-desc' | 'date-asc' | 'source'
