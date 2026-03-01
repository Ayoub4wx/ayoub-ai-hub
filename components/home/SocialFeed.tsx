'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Youtube, Instagram, ExternalLink, Eye, Calendar } from 'lucide-react'
import { YouTubeVideo, TikTokPost, InstagramPost } from '@/types/social'
import { formatDate } from '@/lib/utils'
import Image from 'next/image'

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.26 6.26 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.78a4.85 4.85 0 01-1-.09z" />
    </svg>
  )
}

interface SocialFeedProps {
  youtubeVideos: YouTubeVideo[]
  tiktokVideos: TikTokPost[]
  instagramPosts: InstagramPost[]
}

function YouTubeCard({ video }: { video: YouTubeVideo }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="border-border bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 card-hover overflow-hidden">
        <div className="relative aspect-video overflow-hidden bg-secondary">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-1.5 py-0.5 rounded font-medium">
            ▶ YouTube
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-red-400 transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {video.viewCount && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {Number(video.viewCount).toLocaleString()} views
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(video.publishedAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}

function TikTokCard({ video }: { video: TikTokPost }) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="border-border bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 card-hover overflow-hidden">
        <div className="relative aspect-[9/16] overflow-hidden bg-secondary">
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            unoptimized
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="absolute bottom-2 right-2 bg-black text-white text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
            <TikTokIcon className="w-3 h-3" />
            TikTok
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <TikTokIcon className="w-3 h-3" />
            {video.authorName}
          </div>
        </CardContent>
      </Card>
    </a>
  )
}

function InstagramCard({ post }: { post: InstagramPost }) {
  const reelId = post.url.match(/reel\/([^/?]+)/)?.[1]

  return (
    <a
      href="https://www.instagram.com/ayoub.env/"
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="border-border bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 card-hover overflow-hidden">
        <div className="relative aspect-[9/16] overflow-hidden bg-secondary">
          {reelId ? (
            /* pointer-events-none lets clicks pass through to the <a> wrapper */
            <iframe
              src={`https://www.instagram.com/reel/${reelId}/embed/captioned/`}
              className="w-full h-full border-0 pointer-events-none"
              scrolling="no"
              allow="encrypted-media"
              tabIndex={-1}
              title={post.title}
            />
          ) : (
            <Image
              src={post.thumbnail}
              alt={post.title}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
          <div className="absolute bottom-2 right-2 bg-pink-600 text-white text-xs px-1.5 py-0.5 rounded font-medium flex items-center gap-1 pointer-events-none">
            <Instagram className="w-3 h-3" />
            Instagram
          </div>
        </div>
        <CardContent className="p-3">
          <h3 className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-white transition-colors">
            {post.title}
          </h3>
          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Instagram className="w-3 h-3" />
            {post.authorName}
          </div>
        </CardContent>
      </Card>
    </a>
  )
}

function YouTubeProfileCard() {
  return (
    <a
      href="https://www.youtube.com/@aiwithayoub"
      target="_blank"
      rel="noopener noreferrer"
      className="group block mb-6"
    >
      <Card className="border-red-500/20 bg-gradient-to-br from-red-950/40 via-red-900/20 to-secondary/30 hover:from-red-950/60 hover:via-red-900/40 transition-all duration-300 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500 to-red-700 p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-background">
                  <Image
                    src="/pfp.jpg"
                    alt="aiwithayoub"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base">AI with Ayoub</span>
                <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">
                  Channel
                </span>
              </div>
              <p className="text-sm text-muted-foreground">@aiwithayoub</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                AI tutorials, news & tech deep dives 🎥 • Subscribe for weekly uploads
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-4 py-2 rounded-full group-hover:opacity-90 transition-opacity shadow-lg shadow-red-500/20">
                <Youtube className="w-4 h-4" />
                Subscribe
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}

function TikTokProfileCard() {
  return (
    <a
      href="https://www.tiktok.com/@ayoub.env"
      target="_blank"
      rel="noopener noreferrer"
      className="group block mb-6"
    >
      <Card className="border-white/10 bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-secondary/30 hover:from-gray-900/80 hover:via-gray-800/60 transition-all duration-300 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#69C9D0] to-[#EE1D52] p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-background">
                  <Image
                    src="/pfp.jpg"
                    alt="ayoub.env"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base">Ayoub</span>
                <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10">
                  Creator
                </span>
              </div>
              <p className="text-sm text-muted-foreground">@ayoub.env</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                Short-form AI & tech content ⚡ • Follow for daily drops
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#EE1D52] to-[#69C9D0] text-white text-sm font-semibold px-4 py-2 rounded-full group-hover:opacity-90 transition-opacity shadow-lg shadow-black/30">
                <TikTokIcon className="w-4 h-4" />
                Follow
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}

function InstagramProfileCard() {
  return (
    <a
      href="https://www.instagram.com/ayoub.env/"
      target="_blank"
      rel="noopener noreferrer"
      className="group block mb-6"
    >
      <Card className="border-pink-500/20 bg-gradient-to-br from-pink-950/40 via-purple-950/40 to-secondary/30 hover:from-pink-950/60 hover:via-purple-950/60 transition-all duration-300 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {/* Profile photo */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 p-[2px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-background">
                  <Image
                    src="/pfp.jpg"
                    alt="ayoub.env"
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base">Ayoub</span>
                <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full border border-pink-500/20">
                  Creator
                </span>
              </div>
              <p className="text-sm text-muted-foreground">@ayoub.env</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                AI & Tech content 🤖 • Tips, tools & trends in technology
              </p>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full group-hover:opacity-90 transition-opacity shadow-lg shadow-pink-500/20">
                <Instagram className="w-4 h-4" />
                Follow
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </a>
  )
}

function TikTokPlaceholder() {
  return (
    <a
      href="https://www.tiktok.com/@ayoub.env"
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
    >
      <Card className="border-border bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 card-hover overflow-hidden">
        <div className="aspect-[9/16] bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
          <div className="text-center px-4">
            <TikTokIcon className="w-10 h-10 mx-auto mb-2 text-white/40" />
            <p className="text-xs text-white/40 font-medium">@ayoub.env</p>
          </div>
        </div>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground">
            Add video URLs to{' '}
            <span className="font-mono text-primary/70">constants/social-videos.ts</span>
          </p>
        </CardContent>
      </Card>
    </a>
  )
}

export default function SocialFeed({ youtubeVideos, tiktokVideos, instagramPosts }: SocialFeedProps) {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-2">
          Latest <span className="gradient-text">Content</span>
        </h2>
        <p className="text-muted-foreground">Follow Ayoub across all platforms</p>
      </div>

      <Tabs defaultValue="youtube" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto mb-8 bg-secondary">
          <TabsTrigger value="youtube" className="gap-2 data-[state=active]:bg-red-500/20">
            <Youtube className="w-4 h-4 text-red-500" />
            YouTube
          </TabsTrigger>
          <TabsTrigger value="tiktok" className="gap-2 data-[state=active]:bg-white/10">
            <TikTokIcon className="w-4 h-4" />
            TikTok
          </TabsTrigger>
          <TabsTrigger value="instagram" className="gap-2 data-[state=active]:bg-pink-500/20">
            <Instagram className="w-4 h-4 text-pink-500" />
            Instagram
          </TabsTrigger>
        </TabsList>

        <TabsContent value="youtube">
          <YouTubeProfileCard />
          {youtubeVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {youtubeVideos.map((video) => (
                <YouTubeCard key={video.videoId} video={video} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <a
                  key={i}
                  href="https://www.youtube.com/@aiwithayoub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <Card className="border-border bg-secondary/30 hover:bg-secondary/60 transition-all card-hover overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-red-900/30 to-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <Youtube className="w-12 h-12 mx-auto mb-2 text-red-400/60" />
                        <p className="text-xs text-muted-foreground">@aiwithayoub</p>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium group-hover:text-red-400 transition-colors">
                        AI & Tech Tutorial #{i}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Watch on YouTube</p>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          )}
          <div className="mt-4 text-center">
            <a
              href="https://www.youtube.com/@aiwithayoub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-red-400 hover:text-red-300 transition-colors inline-flex items-center gap-1"
            >
              Subscribe to @aiwithayoub
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </TabsContent>

        <TabsContent value="tiktok">
          <TikTokProfileCard />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {tiktokVideos.length > 0
              ? tiktokVideos.map((video, i) => <TikTokCard key={i} video={video} />)
              : [0, 1, 2].map((i) => <TikTokPlaceholder key={i} />)
            }
          </div>
          <div className="mt-4 text-center">
            <a
              href="https://www.tiktok.com/@ayoub.env"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
            >
              Follow @ayoub.env on TikTok
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </TabsContent>

        <TabsContent value="instagram">
          <InstagramProfileCard />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {instagramPosts.length > 0 ? (
              instagramPosts.map((post, i) => (
                <InstagramCard key={i} post={post} />
              ))
            ) : (
              [1, 2, 3].map((i) => (
                <a
                  key={i}
                  href="https://www.instagram.com/ayoub.env"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <Card className="border-border bg-secondary/30 hover:bg-secondary/60 transition-all card-hover overflow-hidden">
                    <div className="aspect-[9/16] bg-gradient-to-br from-pink-900/50 to-purple-900/50 flex items-center justify-center">
                      <div className="text-center">
                        <Instagram className="w-10 h-10 mx-auto mb-2 text-pink-400/60" />
                        <p className="text-xs text-pink-400/60">@ayoub.env</p>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="text-sm font-medium group-hover:text-pink-400 transition-colors">
                        View on Instagram
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">@ayoub.env</p>
                    </CardContent>
                  </Card>
                </a>
              ))
            )}
          </div>
          <div className="mt-4 text-center">
            <a
              href="https://www.instagram.com/ayoub.env"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-pink-400 hover:text-pink-300 transition-colors inline-flex items-center gap-1"
            >
              Follow @ayoub.env on Instagram
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
