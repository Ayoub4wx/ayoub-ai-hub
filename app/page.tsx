import HeroSection from '@/components/home/HeroSection'
import SocialFeed from '@/components/home/SocialFeed'
import NewsHighlights from '@/components/home/NewsHighlights'
import CallToAction from '@/components/home/CallToAction'
import { fetchAllNews } from '@/lib/rss'
import { fetchTikTokVideos, fetchInstagramPosts } from '@/lib/social'
import { YouTubeVideo } from '@/types/social'

export const revalidate = 900 // ISR: re-generate every 15 mins

async function getYouTubeVideos(): Promise<YouTubeVideo[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/social/youtube`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}


export default async function HomePage() {
  const [articles, youtubeVideos, tiktokVideos, instagramPosts] = await Promise.allSettled([
    fetchAllNews(),
    getYouTubeVideos(),
    fetchTikTokVideos(),
    fetchInstagramPosts(),
  ])

  const newsArticles = articles.status === 'fulfilled' ? articles.value : []
  const videos = youtubeVideos.status === 'fulfilled' ? youtubeVideos.value : []
  const tiktoks = tiktokVideos.status === 'fulfilled' ? tiktokVideos.value : []
  const instas = instagramPosts.status === 'fulfilled' ? instagramPosts.value : []

  return (
    <div className="min-h-screen">
      <HeroSection />
      <NewsHighlights articles={newsArticles} />
      <SocialFeed
        youtubeVideos={videos}
        tiktokVideos={tiktoks}
        instagramPosts={instas}
      />
      <CallToAction />
    </div>
  )
}
