'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Youtube, Instagram, Bot, Users, Rss, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.26 6.26 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.78a4.85 4.85 0 01-1-.09z" />
    </svg>
  )
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 animated-gradient opacity-50" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Left: Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Badge */}
            <Badge className="mb-5 bg-violet-500/20 text-violet-300 border-violet-500/30 px-3 py-1 text-xs">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full mr-1.5 inline-block animate-pulse" />
              AI & Tech Influencer
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-5 leading-tight">
              Hey, I&apos;m{' '}
              <span className="gradient-text">Ayoub</span>
            </h1>

            <p className="text-xl sm:text-2xl text-muted-foreground mb-3 font-light">
              AI & Tech News, Updates, Community
            </p>

            <p className="text-muted-foreground mb-8 text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
              Explore the latest in AI, machine learning, and tech. Get curated news,
              chat with my AI assistant, and join a growing community of AI enthusiasts.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-8">
              <Link href="/community">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white border-0 gap-2 h-12 px-6"
                >
                  <Users className="w-4 h-4" />
                  Join Community
                </Button>
              </Link>
              <Link href="/ask-ai">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white border-0 gap-2 h-12 px-6"
                >
                  <Bot className="w-4 h-4" />
                  Ask AI
                </Button>
              </Link>
              <Link href="/news">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-secondary gap-2 h-12 px-6"
                >
                  <Rss className="w-4 h-4" />
                  AI News
                </Button>
              </Link>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <a
                href="https://www.youtube.com/@aiwithayoub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 flex items-center justify-center transition-colors">
                  <Youtube className="w-4 h-4 text-red-500" />
                </div>
                YouTube
              </a>
              <a
                href="https://www.tiktok.com/@ayoub.env"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                  <TikTokIcon className="w-4 h-4" />
                </div>
                TikTok
              </a>
              <a
                href="https://www.instagram.com/ayoub.env"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-pink-400 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 group-hover:bg-pink-500/20 flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4 text-pink-500" />
                </div>
                Instagram
              </a>
            </div>
          </div>

          {/* Right: Profile card */}
          <div className="relative lg:flex-shrink-0">
            {/* Glowing ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 blur-2xl opacity-30 scale-110" />

            {/* Avatar */}
            <div className="relative w-56 h-56 sm:w-72 sm:h-72">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 p-1">
                <div className="w-full h-full rounded-full bg-background overflow-hidden">
                  <Image
                    src="/pfp.jpg"
                    alt="Ayoub"
                    width={288}
                    height={288}
                    className="w-full h-full object-cover object-top"
                    priority
                  />
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-2 -right-4 bg-background border border-border rounded-xl px-3 py-1.5 shadow-lg">
                <p className="text-xs font-semibold text-muted-foreground">AI Creator</p>
                <p className="text-sm font-bold gradient-text">& Educator</p>
              </div>

              <div className="absolute -bottom-2 -left-4 bg-background border border-border rounded-xl px-3 py-1.5 shadow-lg">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-xs text-muted-foreground">AI News</p>
                </div>
                <p className="text-sm font-bold">Daily Updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto lg:mx-0">
          {[
            { label: 'AI News Sources', value: '4+', icon: Rss },
            { label: 'Community Members', value: 'Growing', icon: Users },
            { label: 'AI Topics Covered', value: '50+', icon: Bot },
            { label: 'Trivia Questions', value: '50', icon: ChevronRight },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-secondary/50 border border-border rounded-xl p-4 text-center backdrop-blur-sm"
            >
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-1.5" />
              <p className="text-xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
