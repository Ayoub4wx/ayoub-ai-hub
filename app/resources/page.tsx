import { Metadata } from 'next'
import Link from 'next/link'
import { ExternalLink, Coffee, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AFFILIATE_CATEGORIES } from '@/constants/affiliate-links'

export const metadata: Metadata = {
  title: 'AI Resources & Tools',
  description: 'Curated list of the best AI tools, subscriptions, and resources handpicked by Ayoub. Find the right AI tool for every task.',
}

export default function ResourcesPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-12 text-center">
        <Badge className="mb-4 bg-violet-500/20 text-violet-300 border-violet-500/30">
          Handpicked by Ayoub
        </Badge>
        <h1 className="text-4xl font-bold mb-4">
          Best <span className="gradient-text">AI Tools & Resources</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Every tool I personally use or recommend. Start with the free ones — upgrade only when you need more.
        </p>
        <p className="text-xs text-muted-foreground mt-3">
          Some links are affiliate links — you pay the same price, but I earn a small commission. Thank you for your support!
        </p>
      </div>

      {/* Support banner */}
      <div className="mb-10 flex items-center justify-between gap-4 bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-6 py-4">
        <div>
          <p className="text-sm font-medium text-yellow-300">Enjoy this site for free?</p>
          <p className="text-xs text-muted-foreground">Support Ayoub&apos;s work by buying him a coffee ☕</p>
        </div>
        <a
          href="https://ko-fi.com/ayoubai"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-black font-semibold text-sm px-4 py-2 rounded-full transition-all hover:scale-105"
        >
          <Coffee className="w-3.5 h-3.5" />
          Ko-fi
        </a>
      </div>

      {/* Categories */}
      <div className="space-y-14">
        {AFFILIATE_CATEGORIES.map((category) => (
          <section key={category.name}>
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <span className="text-2xl">{category.icon}</span>
              {category.name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.tools.map((tool) => (
                <a
                  key={tool.name}
                  href={tool.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative flex flex-col bg-secondary/40 hover:bg-secondary/70 border rounded-xl p-5 transition-all hover:shadow-lg hover:-translate-y-0.5 ${
                    tool.highlight
                      ? 'border-violet-500/40 hover:border-violet-500/70'
                      : 'border-border hover:border-border/80'
                  }`}
                >
                  {tool.tag && (
                    <span className={`absolute top-3 right-3 text-xs font-medium px-2 py-0.5 rounded-full ${
                      tool.highlight
                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                        : 'bg-secondary text-muted-foreground border border-border'
                    }`}>
                      {tool.highlight && <Star className="w-2.5 h-2.5 inline mr-1" />}
                      {tool.tag}
                    </span>
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-base mb-1 group-hover:text-violet-300 transition-colors pr-16">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-medium text-cyan-400">{tool.price}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                      Visit
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-16 text-center border border-border rounded-2xl p-8 bg-secondary/20">
        <h3 className="text-xl font-bold mb-2">Want more AI tips?</h3>
        <p className="text-muted-foreground mb-5">
          Follow Ayoub on YouTube for tutorials on how to use these tools effectively.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="https://www.youtube.com/@aiwithayoub"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="bg-red-600 hover:bg-red-500 text-white">
              Subscribe on YouTube
            </Button>
          </a>
          <Link href="/ask-ai">
            <Button variant="outline">Ask the AI assistant</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
