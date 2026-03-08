import { NextRequest, NextResponse } from 'next/server'
import { isAiBloggerAdminAuthenticated } from '@/lib/ai-blogger-admin'

export async function POST(request: NextRequest) {
  if (!isAiBloggerAdminAuthenticated()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
  const url = new URL('/api/cron/ai-blogger', request.url)
  if (topic) url.searchParams.set('topic', topic)

  const response = await fetch(url, {
    method: 'GET',
    headers: process.env.CRON_SECRET
      ? { authorization: `Bearer ${process.env.CRON_SECRET}` }
      : undefined,
    cache: 'no-store',
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
