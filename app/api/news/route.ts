import { NextRequest, NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getNewsArticles } from '@/lib/rss'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const source = searchParams.get('source')
    const topic = searchParams.get('topic')?.toLowerCase()
    const sort = searchParams.get('sort') || 'date-desc'
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Bust the 1-hour cache when user explicitly requests a refresh
    if (forceRefresh) {
      revalidateTag('news')
    }

    let articles = await getNewsArticles()

    // Filter by source
    if (source) {
      const sources = source.split(',')
      articles = articles.filter((a) => sources.includes(a.sourceId))
    }

    // Filter by topic (search in title and summary)
    if (topic) {
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(topic) ||
          a.summary.toLowerCase().includes(topic)
      )
    }

    // Sort
    if (sort === 'date-asc') {
      articles = articles.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      )
    } else if (sort === 'source') {
      articles = articles.sort((a, b) => a.source.localeCompare(b.source))
    }
    // Default: date-desc (already sorted from fetchAllNews)

    return NextResponse.json(articles, {
      headers: {
        'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200',
      },
    })
  } catch (error) {
    console.error('News API error:', error)
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 })
  }
}
