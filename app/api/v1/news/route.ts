import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { hashApiKey } from '@/lib/api-key'
import { getNewsArticles } from '@/lib/rss'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Extract key from Authorization: Bearer ayb_xxxxx
  const authHeader = request.headers.get('Authorization')
  const key = authHeader?.replace('Bearer ', '').trim()

  if (!key || !key.startsWith('ayb_')) {
    return NextResponse.json(
      { error: 'Missing or invalid API key. Pass your key in the Authorization header: Bearer ayb_...' },
      { status: 401 }
    )
  }

  // Use service role to bypass RLS for API key lookup
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const keyHash = hashApiKey(key)
  const { data: apiKey } = await supabase
    .from('api_keys')
    .select('id, plan, daily_limit, requests_today, total_requests, last_reset_at')
    .eq('key_hash', keyHash)
    .eq('is_active', true)
    .single()

  if (!apiKey) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  // Reset daily counter if it's a new day
  const lastReset = new Date(apiKey.last_reset_at)
  const now = new Date()
  let requestsToday = apiKey.requests_today

  if (lastReset.toDateString() !== now.toDateString()) {
    await supabase
      .from('api_keys')
      .update({ requests_today: 0, last_reset_at: now.toISOString() })
      .eq('id', apiKey.id)
    requestsToday = 0
  }

  // Check rate limit
  if (requestsToday >= apiKey.daily_limit) {
    return NextResponse.json(
      {
        error: 'Daily rate limit exceeded',
        limit: apiKey.daily_limit,
        used: requestsToday,
        reset: 'Resets at midnight UTC',
        upgrade: 'https://ayoub-ai-hub-xhdx.vercel.app/developer#plans',
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': apiKey.daily_limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Plan': apiKey.plan,
        },
      }
    )
  }

  // Increment usage counter
  await supabase
    .from('api_keys')
    .update({
      requests_today: requestsToday + 1,
      total_requests: apiKey.total_requests + 1,
    })
    .eq('id', apiKey.id)

  // Parse query params
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')
  const topic = searchParams.get('topic')?.toLowerCase()
  const sort = searchParams.get('sort') || 'date-desc'
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)

  let articles = await getNewsArticles()

  if (source) {
    const sources = source.split(',')
    articles = articles.filter((a) => sources.includes(a.sourceId))
  }

  if (topic) {
    articles = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(topic) ||
        a.summary.toLowerCase().includes(topic)
    )
  }

  if (sort === 'date-asc') {
    articles = articles.sort(
      (a, b) => new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
    )
  } else if (sort === 'source') {
    articles = articles.sort((a, b) => a.source.localeCompare(b.source))
  }

  articles = articles.slice(0, limit)

  return NextResponse.json(
    {
      data: articles,
      meta: {
        count: articles.length,
        plan: apiKey.plan,
        requests_used_today: requestsToday + 1,
        daily_limit: apiKey.daily_limit,
        sources_available: ['arxiv', 'techcrunch', 'wired', 'mit'],
      },
    },
    {
      headers: {
        'X-RateLimit-Limit': apiKey.daily_limit.toString(),
        'X-RateLimit-Remaining': (apiKey.daily_limit - requestsToday - 1).toString(),
        'X-RateLimit-Plan': apiKey.plan,
        'Cache-Control': 'no-store',
      },
    }
  )
}
