import Parser from 'rss-parser'
import { unstable_cache } from 'next/cache'
import { NewsArticle, RSSFeedConfig } from '@/types/news'
import { RSS_FEEDS } from '@/constants/rss-feeds'
import { stripHtml, generateId } from '@/lib/utils'

const parser = new Parser({
  customFields: {
    item: [['media:content', 'mediaContent'], ['media:thumbnail', 'mediaThumbnail']],
  },
})

const MOCK_ARTICLES: NewsArticle[] = [
  {
    id: 'mock-1',
    title: 'The Future of Agentic AI: How Autonomous Agents are Reshaping Tech',
    summary: 'Autonomous AI agents are moving beyond simple chatbots to performing complex, multi-step tasks across different software ecosystems. This shift represents the next frontier in artificial intelligence.',
    url: 'https://techcrunch.com/category/artificial-intelligence/',
    source: 'TechCrunch AI',
    sourceId: 'techcrunch',
    publishedAt: new Date().toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
    author: 'Ayoub AI Bot',
    categories: ['Agentic AI', 'Future Tech']
  },
  {
    id: 'mock-2',
    title: 'OpenAI Releases New Feature for Developers to Build Scalable Apps',
    summary: 'The latest update from OpenAI focuses on reliability and cost-reduction for large-scale enterprise deployments, making it easier than ever to integrate LLMs into production environments.',
    url: 'https://openai.com/blog',
    source: 'Wired AI',
    sourceId: 'wired',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
    author: 'Ayoub AI Bot',
    categories: ['OpenAI', 'Development']
  }
]

async function parseFeed(feed: RSSFeedConfig): Promise<NewsArticle[]> {
  try {
    const result = await parser.parseURL(feed.url)
    return (result.items || []).slice(0, 20).map((item) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = item as unknown as Record<string, any>
      let imageUrl: string | undefined

      // Try multiple common media fields
      const mediaContent = raw['mediaContent']
      const mediaThumbnail = raw['mediaThumbnail']
      const content = item.content || ''

      if (mediaContent?.$) {
        imageUrl = (mediaContent.$ as Record<string, string>)['url']
      } else if (mediaThumbnail?.$) {
        imageUrl = (mediaThumbnail.$ as Record<string, string>)['url']
      } else if (raw['enclosure']?.url) {
        imageUrl = raw['enclosure'].url
      }

      // Fallback: try to find an image tag in the content
      if (!imageUrl && content) {
        const imgMatch = content.match(/<img[^>]+src="([^">]+)"/)
        if (imgMatch) imageUrl = imgMatch[1]
      }

      const summary = stripHtml(item.contentSnippet || item.content || item.summary || '')

      return {
        id: generateId(),
        title: item.title || 'Untitled',
        summary: summary.slice(0, 300),
        url: item.link || '',
        source: feed.name,
        sourceId: feed.id,
        publishedAt: item.pubDate || item.isoDate || new Date().toISOString(),
        imageUrl,
        author: raw['creator'] || raw['author'] || undefined,
        categories: item.categories || [],
      } satisfies NewsArticle
    })
  } catch (err) {
    console.warn(`Failed to parse feed ${feed.name}:`, err)
    return []
  }
}

export async function fetchAllNews(): Promise<NewsArticle[]> {
  let articles: NewsArticle[] = []
  try {
    const results = await Promise.allSettled(RSS_FEEDS.map((f) => parseFeed(f)))
    articles = results
      .filter((r) => r.status === 'fulfilled')
      .flatMap((r) => (r as PromiseFulfilledResult<NewsArticle[]>).value)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  } catch (err) {
    console.error('Critical failure fetching news:', err)
  }

  // If no articles fetched from any source, use mock data
  if (articles.length === 0) {
    articles = MOCK_ARTICLES
  }

  return articles
}

// Persistent 1-hour cache using Next.js Data Cache (survives serverless cold starts)
export const getNewsArticles = unstable_cache(
  fetchAllNews,
  ['news-articles'],
  { revalidate: 3600, tags: ['news'] }
)
