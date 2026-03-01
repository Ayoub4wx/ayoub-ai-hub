'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'

export default function NewPostPage() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const addTag = () => {
    const tag = tagInput.trim().replace(/^#/, '')
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, tags }),
      })

      if (res.status === 401) {
        toast({ title: 'Please log in', description: 'You need to be logged in to post.', variant: 'destructive' })
        router.push('/auth/login?redirectTo=/community/new-post')
        return
      }

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to create post')
      }

      const post = await res.json()
      toast({ title: 'Post created!', description: 'Your post is now live.' })
      router.push(`/community/post/${post.id}`)
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link href="/community" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back to Community
      </Link>

      <h1 className="text-3xl font-bold mb-6">
        Create <span className="gradient-text">Post</span>
      </h1>

      <Card className="border-border bg-secondary/20">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What's on your mind about AI?"
                maxLength={200}
                required
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{title.length}/200</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Content *</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, questions, or discoveries..."
                rows={8}
                maxLength={10000}
                required
                className="bg-secondary border-border resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{content.length}/10000</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Tags (max 5)</label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder="Add a tag (e.g. LLM)"
                  className="bg-secondary border-border"
                  disabled={tags.length >= 5}
                />
                <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 5}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-secondary border-border gap-1.5">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTags(tags.filter((t) => t !== tag))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || !title.trim() || !content.trim()}
              className="w-full bg-violet-600 hover:bg-violet-500 text-white border-0"
            >
              {loading ? 'Publishing...' : 'Publish Post'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
