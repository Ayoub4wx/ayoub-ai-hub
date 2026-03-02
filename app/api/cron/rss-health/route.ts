import { NextResponse } from 'next/server'
import Parser from 'rss-parser'
import { verifyCronAuth } from '@/lib/cron-auth'
import { RSS_FEEDS } from '@/constants/rss-feeds'

export const dynamic = 'force-dynamic'

const parser = new Parser()

export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  const results = await Promise.all(
    RSS_FEEDS.map(async (feed) => {
      const start = Date.now()
      try {
        const result = await Promise.race([
          parser.parseURL(feed.url),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout after 10s')), 10000)
          ),
        ])
        return {
          id: feed.id,
          name: feed.name,
          ok: true,
          latencyMs: Date.now() - start,
          articleCount: result.items?.length ?? 0,
        }
      } catch (err) {
        return {
          id: feed.id,
          name: feed.name,
          ok: false,
          latencyMs: Date.now() - start,
          articleCount: 0,
          error: String(err),
        }
      }
    })
  )

  const allHealthy = results.every((r) => r.ok)

  // Optional: alert via Slack webhook if any feed is down
  if (!allHealthy && process.env.SLACK_WEBHOOK_URL) {
    const failedFeeds = results.filter((r) => !r.ok)
    const message = failedFeeds
      .map((f) => `• *${f.name}*: ${f.error}`)
      .join('\n')
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: `RSS Feed Health Alert:\n${message}` }),
    }).catch(() => {}) // Non-critical
  }

  return NextResponse.json({
    success: true,
    allHealthy,
    checkedAt: new Date().toISOString(),
    feeds: results,
  })
}
