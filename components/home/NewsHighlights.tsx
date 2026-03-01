import Link from 'next/link'
import { ExternalLink, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { NewsArticle } from '@/types/news'
import { formatDate, truncate } from '@/lib/utils'

interface NewsHighlightsProps {
  articles: NewsArticle[]
}

const SOURCE_COLORS: Record<string, string> = {
  arxiv: 'bg-red-500/20 text-red-300 border-red-500/30',
  techcrunch: 'bg-green-500/20 text-green-300 border-green-500/30',
  wired: 'bg-white/10 text-white/70 border-white/20',
  mit: 'bg-red-800/20 text-red-300 border-red-800/30',
  openai: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
}

export default function NewsHighlights({ articles }: NewsHighlightsProps) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            Latest <span className="gradient-text">AI News</span>
          </h2>
          <p className="text-muted-foreground">Curated from top AI & tech sources</p>
        </div>
        <Link href="/news">
          <Button variant="outline" className="gap-2 hidden sm:flex">
            View All News
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {articles.slice(0, 3).map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block group"
          >
            <Card className="h-full border-border bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 card-hover overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge
                    variant="outline"
                    className={`text-xs ${SOURCE_COLORS[article.sourceId] || 'bg-violet-500/20 text-violet-300 border-violet-500/30'}`}
                  >
                    {article.source}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {formatDate(article.publishedAt)}
                  </div>
                </div>

                <h3 className="font-semibold text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-3">
                  {article.title}
                </h3>

                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  {truncate(article.summary, 150)}
                </p>

                <div className="mt-4 flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Read article
                  <ExternalLink className="w-3 h-3" />
                </div>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link href="/news">
          <Button variant="outline" className="gap-2">
            View All News
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </section>
  )
}
