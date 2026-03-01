'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusCircle, TrendingUp, Hash, Users, Heart, MessageCircle, Clock, Loader2, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Post } from '@/types/community'
import { formatDate, truncate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const TRENDING_TAGS = ['LLM', 'GPT-4', 'Gemini', 'OpenSource', 'AITools', 'MachineLearning', 'Prompt', 'RAG', 'Agents', 'RLHF']

function PostCard({ post }: { post: Post }) {
  return (
    <Link href={`/community/post/${post.id}`} className="block group">
      <Card className="border-border bg-secondary/30 hover:bg-secondary/60 transition-all duration-200 card-hover">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Avatar className="w-9 h-9 shrink-0">
              <AvatarFallback className="bg-violet-600/20 text-violet-300 text-sm">
                {(post.author?.display_name || post.author?.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-medium">{post.author?.display_name || post.author?.username}</span>
                {post.author?.username === 'ai_blogger' && (
                  <Badge className="text-xs bg-violet-500/20 text-violet-300 border-violet-500/30 px-1.5 py-0 flex items-center gap-1">
                    <Bot className="w-2.5 h-2.5" />
                    AI
                  </Badge>
                )}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(post.created_at)}
                </span>
              </div>

              <h3 className="font-semibold text-base leading-snug mb-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>

              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {truncate(post.content, 160)}
              </p>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs bg-secondary border-border">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" />
                  {post.like_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  {post.comment_count || 0}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const fetchPosts = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true)
    else setLoadingMore(true)

    try {
      const res = await fetch(`/api/community/posts?page=${pageNum}&limit=10`)
      const data = await res.json()
      if (Array.isArray(data)) {
        if (append) {
          setPosts((prev) => [...prev, ...data])
        } else {
          setPosts(data)
        }
        setHasMore(data.length === 10)
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchPosts(1)
    createClient().auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user))
  }, [])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    fetchPosts(next, true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main feed */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">
                <span className="gradient-text">Community</span>
              </h1>
              <p className="text-muted-foreground text-sm mt-1">AI & tech discussions</p>
            </div>
            <Link href="/community/new-post">
              <Button className="gap-2 bg-violet-600 hover:bg-violet-500 text-white border-0">
                <PlusCircle className="w-4 h-4" />
                New Post
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <Card key={i} className="border-border bg-secondary/30">
                  <CardContent className="p-5 space-y-3">
                    <div className="flex gap-3">
                      <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-5 w-5/6" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">💬</p>
              <p className="text-lg font-medium mb-2">No posts yet</p>
              <p className="text-muted-foreground text-sm mb-6">Be the first to start a discussion!</p>
              <Link href="/community/new-post">
                <Button className="gap-2 bg-violet-600 hover:bg-violet-500 text-white border-0">
                  <PlusCircle className="w-4 h-4" />
                  Create First Post
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}

              {hasMore && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="gap-2"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:w-72 space-y-5 shrink-0">
          {/* Quick join — only shown to logged-out users */}
          {!isLoggedIn && (
            <Card className="border-border bg-gradient-to-br from-violet-900/30 to-cyan-900/20">
              <CardContent className="p-5 text-center">
                <Users className="w-8 h-8 text-violet-400 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Join the Discussion</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Share your AI insights, ask questions, and connect with other enthusiasts.
                </p>
                <Link href="/auth/register">
                  <Button size="sm" className="w-full bg-violet-600 hover:bg-violet-500 text-white border-0">
                    Create Account
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Trending tags */}
          <Card className="border-border bg-secondary/30">
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {TRENDING_TAGS.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs bg-secondary border-border hover:bg-accent cursor-pointer transition-colors"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Guidelines */}
          <Card className="border-border bg-secondary/30">
            <CardContent className="p-5">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-cyan-400" />
                Community Rules
              </h3>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>✅ Be respectful and constructive</li>
                <li>✅ Stay on topic: AI, ML & tech</li>
                <li>✅ Share knowledge and resources</li>
                <li>❌ No spam or self-promotion</li>
                <li>❌ No misinformation</li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
