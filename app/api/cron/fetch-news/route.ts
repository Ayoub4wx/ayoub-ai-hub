import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { getNewsArticles } from '@/lib/rss'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Bust the cache so the next fetch hits RSS feeds fresh
  revalidateTag('news')

  // Pre-warm the cache immediately
  const articles = await getNewsArticles()

  return NextResponse.json({
    success: true,
    count: articles.length,
    refreshed: new Date().toISOString(),
  })
}
