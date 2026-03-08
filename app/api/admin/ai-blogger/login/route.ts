import { NextRequest, NextResponse } from 'next/server'
import { AI_BLOGGER_ADMIN_COOKIE, getAiBloggerAdminPassword, getAiBloggerAdminToken } from '@/lib/ai-blogger-admin'

export async function POST(request: NextRequest) {
  const password = getAiBloggerAdminPassword()
  if (!password) {
    return NextResponse.json({ error: 'Missing AI_BLOGGER_ADMIN_PASSWORD' }, { status: 500 })
  }

  const body = await request.json().catch(() => ({}))
  if (body.password !== password) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set(AI_BLOGGER_ADMIN_COOKIE, getAiBloggerAdminToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
