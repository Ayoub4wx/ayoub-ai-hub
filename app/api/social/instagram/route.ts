import { NextResponse } from 'next/server'
import { INSTAGRAM_POSTS } from '@/constants/social-videos'

export const revalidate = 3600 // 1 hour

export async function GET() {
    return NextResponse.json(INSTAGRAM_POSTS, {
        headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200' },
    })
}
