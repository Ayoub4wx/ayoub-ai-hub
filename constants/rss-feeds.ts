import { RSSFeedConfig } from '@/types/news'

export const RSS_FEEDS: RSSFeedConfig[] = [
  {
    id: 'arxiv',
    name: 'Arxiv AI',
    url: 'https://rss.arxiv.org/rss/cs.AI',
    color: '#B31B1B',
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
    color: '#00A651',
  },
  {
    id: 'wired',
    name: 'Wired AI',
    url: 'https://www.wired.com/feed/tag/ai/latest/rss',
    color: '#FFFFFF',
  },
  {
    id: 'mit',
    name: 'MIT Tech Review',
    url: 'https://www.technologyreview.com/feed/',
    color: '#A31F34',
  },
]
