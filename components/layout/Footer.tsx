'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Bot, Youtube, Instagram, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

// TikTok icon (not in lucide-react)
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.26 6.26 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.16 8.16 0 004.77 1.52V6.78a4.85 4.85 0 01-1-.09z" />
    </svg>
  )
}

export default function Footer() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        toast({ title: 'Subscribed!', description: 'You\'re now subscribed to the AI newsletter.' })
        setEmail('')
      } else {
        throw new Error('Failed')
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to subscribe. Please try again.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Ko-fi floating button */}
      <a
        href="https://ko-fi.com/ayoubai"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 z-50 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 text-sm"
        aria-label="Support on Ko-fi"
      >
        <Coffee className="w-4 h-4" />
        Support Me
      </a>

    <footer className="border-t border-border bg-background/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group w-fit">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl gradient-text">Ayoub AI Hub</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5 max-w-sm">
              Your hub for AI & tech news, community discussions, and cutting-edge content.
              Stay updated with the latest in artificial intelligence.
            </p>
            {/* Newsletter */}
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border"
              />
              <Button type="submit" disabled={loading} className="shrink-0 bg-violet-600 hover:bg-violet-500">
                {loading ? '...' : 'Subscribe'}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-2">No spam, unsubscribe anytime.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Navigate</h3>
            <ul className="space-y-2">
              {[
                { label: 'AI News', href: '/news' },
                { label: 'Ask AI', href: '/ask-ai' },
                { label: 'Community', href: '/community' },
                { label: 'AI Game', href: '/game' },
                { label: 'Resources', href: '/resources' },
                { label: 'Developer API', href: '/developer' },
                { label: 'Shop', href: '/shop' },
                { label: 'About', href: '/about' },
                { label: 'Contact', href: '/contact' },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials & Legal */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Follow Ayoub</h3>
            <div className="space-y-3">
              <a
                href="https://www.youtube.com/@aiwithayoub"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-red-400 transition-colors"
              >
                <Youtube className="w-4 h-4 text-red-500" />
                @aiwithayoub
              </a>
              <a
                href="https://www.tiktok.com/@ayoub.env"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <TikTokIcon className="w-4 h-4" />
                @ayoub.env
              </a>
              <a
                href="https://www.instagram.com/ayoub.env"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-sm text-muted-foreground hover:text-pink-400 transition-colors"
              >
                <Instagram className="w-4 h-4 text-pink-500" />
                @ayoub.env
              </a>
            </div>

            <div className="mt-6 space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Support</h3>
              <a
                href="https://ko-fi.com/ayoubai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-yellow-400 transition-colors"
              >
                <Coffee className="w-3.5 h-3.5" />
                Buy me a coffee
              </a>
            </div>

            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Legal</h3>
              <Link href="/terms" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="/privacy" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Ayoub AI Hub. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, Supabase & OpenRouter
          </p>
        </div>
      </div>
    </footer>
    </>
  )
}
