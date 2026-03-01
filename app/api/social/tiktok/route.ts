import { NextResponse } from 'next/server'
import { TIKTOK_VIDEO_URLS } from '@/constants/social-videos'
import { TikTokPost } from '@/types/social'

export const revalidate = 3600 // 1 hour

interface OEmbedResponse {
  title: string
  author_name: string
  thumbnail_url: string
}

async function fetchTikTokThumbnail(url: string): Promise<TikTokPost | null> {
  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return null
    const data: OEmbedResponse = await res.json()
    return {
      url,
      thumbnail: data.thumbnail_url,
      title: data.title,
      authorName: data.author_name,
    }
  } catch (error) {
    console.error('TikTok oEmbed error for', url, error)
    return null
  }
}

export async function GET() {
  if (TIKTOK_VIDEO_URLS.length === 0) {
    return NextResponse.json([])
  }

  const results = await Promise.all(TIKTOK_VIDEO_URLS.map(fetchTikTokThumbnail))
  const videos = results.filter((v): v is TikTokPost => v !== null && Boolean(v.thumbnail))

  return NextResponse.json(videos, {
    headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200' },
  })
}
