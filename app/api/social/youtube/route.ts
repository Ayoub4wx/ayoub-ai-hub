import { NextResponse } from 'next/server'
import { YouTubeVideo } from '@/types/social'
import { YOUTUBE_VIDEO_IDS } from '@/constants/social-videos'

export const revalidate = 3600 // 1 hour

const CHANNEL_ID = process.env.YOUTUBE_CHANNEL_ID || 'UCaiwithayoub'
const API_KEY = process.env.YOUTUBE_API_KEY

// Build fallback videos from the real video IDs in constants.
// Thumbnails are served directly from img.youtube.com — no API key needed.
const FALLBACK_VIDEOS: YouTubeVideo[] = YOUTUBE_VIDEO_IDS.map((videoId, i) => ({
  videoId,
  title: 'Watch on YouTube — @aiwithayoub',
  thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  publishedAt: new Date(Date.now() - i * 86400000).toISOString(),
  url: `https://www.youtube.com/watch?v=${videoId}`,
}))

export async function GET() {
  if (!API_KEY || API_KEY === 'placeholder_youtube_key') {
    return NextResponse.json(FALLBACK_VIDEOS)
  }

  try {
    // Get uploads playlist from channel
    const channelRes = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
    )
    const channelData = await channelRes.json()
    const uploadsId =
      channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

    if (!uploadsId) {
      return NextResponse.json(FALLBACK_VIDEOS)
    }

    // Get latest 3 videos
    const playlistRes = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsId}&maxResults=3&key=${API_KEY}`
    )
    const playlistData = await playlistRes.json()

    const videos: YouTubeVideo[] = (playlistData.items || []).map(
      (item: Record<string, unknown>) => {
        const snippet = item.snippet as Record<string, unknown>
        const resourceId = snippet.resourceId as Record<string, unknown>
        const thumbnails = snippet.thumbnails as Record<string, unknown>
        const maxres = thumbnails?.maxres as Record<string, string> | undefined
        const high = thumbnails?.high as Record<string, string> | undefined
        const videoId = resourceId?.videoId as string
        return {
          videoId,
          title: snippet.title as string,
          thumbnail: maxres?.url || high?.url || '',
          publishedAt: snippet.publishedAt as string,
          url: `https://www.youtube.com/watch?v=${videoId}`,
        }
      }
    )

    return NextResponse.json(videos, {
      headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=7200' },
    })
  } catch (error) {
    console.error('YouTube API error:', error)
    return NextResponse.json(FALLBACK_VIDEOS)
  }
}
