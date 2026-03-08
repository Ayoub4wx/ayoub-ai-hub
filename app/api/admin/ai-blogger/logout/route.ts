import { NextResponse } from 'next/server'
import { AI_BLOGGER_ADMIN_COOKIE } from '@/lib/ai-blogger-admin'

export async function POST() {
  const response = NextResponse.json({ success: true })
  response.cookies.set(AI_BLOGGER_ADMIN_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return response
}
