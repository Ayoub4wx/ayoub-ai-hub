import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Youtube, Instagram, Bot, Rss, Users, Gamepad2, Coffee, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about Ayoub — AI & tech influencer, content creator, and educator.',
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.26 6.26 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.78a4.85 4.85 0 01-1-.09z" />
    </svg>
  )
}

const SKILLS = ['Large Language Models', 'Prompt Engineering', 'AI Tools & APIs', 'Machine Learning', 'Next.js', 'Python', 'Content Creation', 'AI Education']

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero */}
      <div className="flex flex-col sm:flex-row items-center gap-10 mb-16">
        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 p-1 shrink-0">
          <div className="w-full h-full rounded-full overflow-hidden">
            <Image
              src="/pfp.jpg"
              alt="Ayoub"
              width={160}
              height={160}
              className="w-full h-full object-cover object-top"
              priority
            />
          </div>
        </div>
        <div>
          <Badge className="mb-3 bg-violet-500/20 text-violet-300 border-violet-500/30">
            AI & Tech Creator
          </Badge>
          <h1 className="text-4xl font-bold mb-3">Hi, I&apos;m <span className="gradient-text">Ayoub</span></h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            I&apos;m passionate about making AI accessible to everyone. I create content about
            artificial intelligence, machine learning tools, and the latest tech trends across
            YouTube, TikTok, and Instagram.
          </p>
        </div>
      </div>

      {/* About content */}
      <div className="prose prose-invert max-w-none mb-16">
        <h2 className="text-2xl font-bold mb-4">About This Hub</h2>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The <strong className="text-foreground">Ayoub AI Hub</strong> is your one-stop destination for everything AI.
          Whether you want to stay updated with the latest AI breakthroughs, have an intelligent conversation with an
          AI assistant, or connect with other AI enthusiasts — you&apos;ve come to the right place.
        </p>
        <p className="text-muted-foreground leading-relaxed mb-4">
          The site features a <strong className="text-foreground">live AI news aggregator</strong> pulling from
          Arxiv, TechCrunch, Wired, and MIT Technology Review. You can also <strong className="text-foreground">chat
          with the AI assistant</strong> powered by free LLMs via OpenRouter, play the
          <strong className="text-foreground"> AI trivia game</strong>, and participate in the community.
        </p>
      </div>

      {/* Skills */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-5">Expertise</h2>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map((skill) => (
            <Badge key={skill} variant="outline" className="px-3 py-1.5 text-sm bg-secondary border-border">
              {skill}
            </Badge>
          ))}
        </div>
      </div>

      {/* Socials */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-5">Find Me Online</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="https://www.youtube.com/@aiwithayoub"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="border-border bg-secondary/30 hover:bg-red-500/10 hover:border-red-500/30 transition-all card-hover">
              <CardContent className="p-5 text-center">
                <Youtube className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="font-medium">YouTube</p>
                <p className="text-sm text-muted-foreground">@aiwithayoub</p>
              </CardContent>
            </Card>
          </a>
          <a
            href="https://www.tiktok.com/@ayoub.env"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="border-border bg-secondary/30 hover:bg-white/5 hover:border-white/20 transition-all card-hover">
              <CardContent className="p-5 text-center">
                <TikTokIcon className="w-8 h-8 mx-auto mb-2" />
                <p className="font-medium">TikTok</p>
                <p className="text-sm text-muted-foreground">@ayoub.env</p>
              </CardContent>
            </Card>
          </a>
          <a
            href="https://www.instagram.com/ayoub.env"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="border-border bg-secondary/30 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all card-hover">
              <CardContent className="p-5 text-center">
                <Instagram className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <p className="font-medium">Instagram</p>
                <p className="text-sm text-muted-foreground">@ayoub.env</p>
              </CardContent>
            </Card>
          </a>
        </div>
      </div>

      {/* Support My Work */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-2">Support My Work</h2>
        <p className="text-muted-foreground mb-5">
          If you enjoy the content and find this hub useful, consider buying me a coffee. It helps me keep creating and building for free.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://ko-fi.com/ayoubai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-6 py-3 rounded-full shadow transition-all hover:scale-105"
          >
            <Coffee className="w-4 h-4" />
            Buy me a coffee on Ko-fi
          </a>
          <a
            href="https://github.com/sponsors/ayoubai"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-pink-500/30 hover:bg-pink-500/10 text-pink-400 font-medium px-6 py-3 rounded-full transition-all"
          >
            <Heart className="w-4 h-4" />
            Sponsor on GitHub
          </a>
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Link href="/ask-ai">
          <Button className="gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0">
            <Bot className="w-4 h-4" />
            Chat with AI
          </Button>
        </Link>
        <Link href="/news">
          <Button variant="outline" className="gap-2">
            <Rss className="w-4 h-4" />
            AI News
          </Button>
        </Link>
        <Link href="/community">
          <Button variant="outline" className="gap-2">
            <Users className="w-4 h-4" />
            Community
          </Button>
        </Link>
        <Link href="/game">
          <Button variant="outline" className="gap-2">
            <Gamepad2 className="w-4 h-4" />
            Play Game
          </Button>
        </Link>
      </div>
    </div>
  )
}
