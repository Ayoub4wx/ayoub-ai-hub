'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Filter, RefreshCw, ExternalLink, Clock, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NewsArticle, NewsSort } from '@/types/news'
import { RSS_FEEDS } from '@/constants/rss-feeds'
import { formatDate, truncate } from '@/lib/utils'

const SOURCE_COLORS: Record<string, string> = {
  arxiv: 'bg-red-500/20 text-red-300 border-red-500/30',
  techcrunch: 'bg-green-500/20 text-green-300 border-green-500/30',
  wired: 'bg-white/10 text-white/70 border-white/20',
  mit: 'bg-red-800/20 text-red-300 border-red-800/30',
  openai: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
}

const SORT_OPTIONS: { label: string; value: NewsSort }[] = [
  { label: 'Newest First', value: 'date-desc' },
  { label: 'Oldest First', value: 'date-asc' },
  { label: 'By Source', value: 'source' },
]

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [sort, setSort] = useState<NewsSort>('date-desc')
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)

  const fetchNews = async (refresh = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (refresh) params.set('refresh', 'true')
      const res = await fetch(`/api/news?${params}`)
      const data = await res.json()
      setArticles(Array.isArray(data) ? data : [])
    } catch {
      console.error('Failed to fetch news')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const filtered = useMemo(() => {
    let result = [...articles]

    if (selectedSources.length > 0) {
      result = result.filter((a) => selectedSources.includes(a.sourceId))
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.source.toLowerCase().includes(q)
      )
    }

    if (sort === 'date-asc') {
      result.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime()
      )
    } else if (sort === 'source') {
      result.sort((a, b) => a.source.localeCompare(b.source))
    }

    return result
  }, [articles, selectedSources, search, sort])

  const toggleSource = (sourceId: string) => {
    setSelectedSources((prev) =>
      prev.includes(sourceId)
        ? prev.filter((s) => s !== sourceId)
        : [...prev, sourceId]
    )
  }

  const currentSort = SORT_OPTIONS.find((o) => o.value === sort)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          AI <span className="gradient-text">News</span>
        </h1>
        <p className="text-muted-foreground">
          Curated AI & tech news from top sources — updated every 15 minutes
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 shrink-0">
              <Filter className="w-4 h-4" />
              {currentSort?.label}
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {SORT_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSort(option.value)}
                className={sort === option.value ? 'text-primary' : ''}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="icon"
          onClick={() => fetchNews(true)}
          title="Refresh news"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Source filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {RSS_FEEDS.map((feed) => (
          <button
            key={feed.id}
            onClick={() => toggleSource(feed.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
              selectedSources.includes(feed.id)
                ? SOURCE_COLORS[feed.id] || 'bg-primary/20 text-primary border-primary/30'
                : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {feed.name}
          </button>
        ))}
        {selectedSources.length > 0 && (
          <button
            onClick={() => setSelectedSources([])}
            className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} article{filtered.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Articles grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array(9).fill(0).map((_, i) => (
            <Card key={i} className="border-border bg-secondary/30">
              <CardContent className="p-5 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📰</p>
          <p className="text-lg font-medium mb-2">No articles found</p>
          <p className="text-muted-foreground text-sm">
            {search ? 'Try different search terms' : 'Refresh to load the latest news'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((article) => (
            <Card
              key={article.id}
              className="border-border bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 card-hover cursor-pointer group overflow-hidden"
              onClick={() => setSelectedArticle(article)}
            >
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
                  {truncate(article.summary, 180)}
                </p>

                <div className="mt-4 text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Preview article <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Article Preview Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div
            className="bg-background border border-border rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${SOURCE_COLORS[selectedArticle.sourceId] || 'bg-violet-500/20 text-violet-300 border-violet-500/30'}`}
                    >
                      {selectedArticle.source}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(selectedArticle.publishedAt)}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold leading-snug">{selectedArticle.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="text-muted-foreground hover:text-foreground text-xl shrink-0 mt-1"
                >
                  ×
                </button>
              </div>

              {selectedArticle.author && (
                <p className="text-xs text-muted-foreground mb-3">By {selectedArticle.author}</p>
              )}

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                {selectedArticle.summary}
              </p>

              <a
                href={selectedArticle.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
              >
                <Button className="gap-2 bg-violet-600 hover:bg-violet-500 text-white border-0">
                  Read Full Article
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
