'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, MessageCircle, Clock, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Post, Comment } from '@/types/community'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<Post & { comments?: Comment[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liked, setLiked] = useState(false)
  const [user, setUser] = useState<{ id: string } | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user ? { id: data.user.id } : null))

    // Real-time: new comments on this post
    const commentsChannel = supabase
      .channel(`post-comments-rt:${id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments', filter: `post_id=eq.${id}` },
        async (payload) => {
          const { data: newComment } = await supabase
            .from('comments')
            .select('*, author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (newComment) {
            setPost((prev) =>
              prev ? { ...prev, comments: [...(prev.comments || []), newComment] } : prev
            )
          }
        }
      )
      .subscribe()

    // Real-time: like count changes on this post
    const likesChannel = supabase
      .channel(`post-likes-rt:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes', filter: `post_id=eq.${id}` },
        async () => {
          const { count } = await supabase
            .from('likes')
            .select('id', { count: 'exact', head: true })
            .eq('post_id', id)
            .is('comment_id', null)
          setLikeCount(count || 0)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(commentsChannel)
      supabase.removeChannel(likesChannel)
    }
  }, [id])

  useEffect(() => {
    fetch(`/api/community/posts/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setPost(null)
        } else {
          setPost(data)
          setLikeCount(data.likes?.[0]?.count || 0)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = async () => {
    if (!user) {
      toast({ title: 'Login required', description: 'Sign in to like posts.', variant: 'destructive' })
      return
    }
    const prev = { liked, count: likeCount }
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)

    const res = await fetch('/api/community/likes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: id }),
    })
    if (!res.ok) {
      setLiked(prev.liked)
      setLikeCount(prev.count)
    } else {
      const data = await res.json()
      setLiked(data.liked)
      setLikeCount(data.count)
    }
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: 'Login required', description: 'Sign in to comment.', variant: 'destructive' })
      return
    }
    if (!commentText.trim()) return
    setSubmitting(true)

    const res = await fetch('/api/community/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: id, content: commentText }),
    })

    if (res.ok) {
      const newComment = await res.json()
      setPost((prev) => prev ? {
        ...prev,
        comments: [...(prev.comments || []), newComment],
      } : prev)
      setCommentText('')
      toast({ title: 'Comment added!' })
    } else {
      toast({ title: 'Error', description: 'Failed to add comment.', variant: 'destructive' })
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🔍</p>
        <h2 className="text-xl font-bold mb-2">Post not found</h2>
        <Link href="/community">
          <Button variant="outline" className="mt-4">Back to Community</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/community" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      {/* Post */}
      <Card className="border-border bg-secondary/30 mb-6">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-10 h-10">
              <AvatarFallback className="bg-violet-600/20 text-violet-300">
                {(post.author?.display_name || post.author?.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{post.author?.display_name || post.author?.username}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(post.created_at)}
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-3">{post.title}</h1>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs bg-secondary border-border">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap mb-6">{post.content}</p>

          <div className="flex items-center gap-4 border-t border-border pt-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-sm transition-colors ${
                liked ? 'text-red-400' : 'text-muted-foreground hover:text-red-400'
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              {likeCount}
            </button>
            <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MessageCircle className="w-4 h-4" />
              {post.comments?.length || 0} comments
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Comments */}
      <h2 className="font-bold text-lg mb-4">
        Comments ({post.comments?.length || 0})
      </h2>

      {/* Add comment */}
      <Card className="border-border bg-secondary/20 mb-5">
        <CardContent className="p-4">
          <form onSubmit={handleComment} className="flex gap-3">
            <Avatar className="w-8 h-8 shrink-0">
              <AvatarFallback className="bg-secondary text-xs">
                {user ? 'U' : '?'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={user ? 'Write a comment...' : 'Sign in to comment'}
                rows={2}
                disabled={!user}
                className="bg-secondary border-border resize-none mb-2 text-sm"
              />
              <Button
                type="submit"
                size="sm"
                disabled={!user || !commentText.trim() || submitting}
                className="gap-1.5 bg-violet-600 hover:bg-violet-500 text-white border-0"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
              {!user && (
                <Link href="/auth/login" className="ml-2 text-xs text-primary hover:underline">
                  Sign in to comment
                </Link>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Comment list */}
      <div className="space-y-4">
        {(post.comments || []).map((comment: Comment) => (
          <Card key={comment.id} className="border-border bg-secondary/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 shrink-0">
                  <AvatarFallback className="bg-violet-600/20 text-violet-300 text-xs">
                    {(comment.author?.display_name || comment.author?.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      {comment.author?.display_name || comment.author?.username}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{comment.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!post.comments || post.comments.length === 0) && (
          <p className="text-center text-muted-foreground text-sm py-8">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>
    </div>
  )
}
