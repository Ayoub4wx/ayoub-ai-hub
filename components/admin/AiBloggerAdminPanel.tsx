'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageIcon, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Post } from '@/types/community'

type EditorState = {
  id?: string
  title: string
  excerpt: string
  meta_description: string
  cover_image_url: string
  cover_image_alt: string
  source_url: string
  source_title: string
  source_site_name: string
  source_image_url: string
  source_published_at: string
  tags: string
  content: string
}

const EMPTY_EDITOR: EditorState = {
  title: '',
  excerpt: '',
  meta_description: '',
  cover_image_url: '',
  cover_image_alt: '',
  source_url: '',
  source_title: '',
  source_site_name: '',
  source_image_url: '',
  source_published_at: '',
  tags: '',
  content: '',
}

function ImagePreviewCard({
  label,
  url,
  alt,
  href,
}: {
  label: string
  url: string
  alt: string
  href?: string
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-secondary/40">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <p className="text-sm font-medium">{label}</p>
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-200"
          >
            Open
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
      {url ? (
        <div className="bg-black/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={alt || label} className="h-52 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-52 items-center justify-center text-muted-foreground">
          <div className="text-center">
            <ImageIcon className="mx-auto mb-3 h-8 w-8 opacity-60" />
            <p className="text-sm">Paste an image URL to preview it here.</p>
          </div>
        </div>
      )}
      <div className="px-4 py-3 text-xs text-muted-foreground break-all">
        {url || 'No image URL set'}
      </div>
    </div>
  )
}

export default function AiBloggerAdminPanel() {
  const router = useRouter()
  const [posts, setPosts] = useState<Post[]>([])
  const [editor, setEditor] = useState<EditorState>(EMPTY_EDITOR)
  const [topic, setTopic] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  const loadPosts = async () => {
    setLoading(true)
    const response = await fetch('/api/admin/ai-blogger/posts', { cache: 'no-store' })
    if (response.status === 401) {
      router.push('/ai-blogger-admin/login')
      return
    }
    const data = await response.json()
    setPosts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  useEffect(() => {
    loadPosts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setField = (field: keyof EditorState, value: string) => {
    setEditor((current) => ({ ...current, [field]: value }))
  }

  const editPost = (post: Post) => {
    setEditor({
      id: post.id,
      title: post.title || '',
      excerpt: post.excerpt || '',
      meta_description: post.meta_description || '',
      cover_image_url: post.cover_image_url || '',
      cover_image_alt: post.cover_image_alt || '',
      source_url: post.source_url || '',
      source_title: post.source_title || '',
      source_site_name: post.source_site_name || '',
      source_image_url: post.source_image_url || '',
      source_published_at: post.source_published_at || '',
      tags: (post.tags || []).join(', '),
      content: post.content || '',
    })
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetEditor = () => {
    setEditor(EMPTY_EDITOR)
    setError('')
  }

  const savePost = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    const payload = {
      ...editor,
      tags: editor.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    }

    const response = await fetch(
      editor.id ? `/api/admin/ai-blogger/posts/${editor.id}` : '/api/admin/ai-blogger/posts',
      {
        method: editor.id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.error || 'Failed to save post')
      setSaving(false)
      return
    }

    resetEditor()
    await loadPosts()
    setSaving(false)
  }

  const deletePost = async (id: string) => {
    const response = await fetch(`/api/admin/ai-blogger/posts/${id}`, { method: 'DELETE' })
    if (response.ok) {
      if (editor.id === id) resetEditor()
      await loadPosts()
    }
  }

  const generatePost = async () => {
    setGenerating(true)
    setError('')
    const response = await fetch('/api/admin/ai-blogger/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      setError(data.error || 'Failed to generate post')
      setGenerating(false)
      return
    }
    setTopic('')
    await loadPosts()
    setGenerating(false)
  }

  const logout = async () => {
    await fetch('/api/admin/ai-blogger/logout', { method: 'POST' })
    router.push('/ai-blogger-admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_35%),linear-gradient(180deg,#020617_0%,#08111f_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300 mb-2">External Admin Panel</p>
            <h1 className="text-3xl font-bold">AI Blogger Console</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Create, edit, generate, and delete posts as if you were logged into the `ai_blogger` profile.
            </p>
          </div>
          <div className="flex gap-3">
            <Input
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="Generate topic, e.g. Anthropic"
              className="w-full min-w-[240px] bg-background/60 lg:w-72"
            />
            <Button onClick={generatePost} disabled={generating} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950">
              {generating ? 'Generating...' : 'Generate'}
            </Button>
            <Button variant="outline" onClick={logout}>Logout</Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-500/30 bg-red-950/20">
            <CardContent className="p-4 text-sm text-red-200">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-border bg-background/70 backdrop-blur">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold">{editor.id ? 'Edit AI Post' : 'New AI Post'}</h2>
                <Button variant="ghost" onClick={resetEditor}>Reset</Button>
              </div>

              <form onSubmit={savePost} className="space-y-4">
                <Input value={editor.title} onChange={(e) => setField('title', e.target.value)} placeholder="Post title" className="bg-secondary/60" />
                <Textarea value={editor.excerpt} onChange={(e) => setField('excerpt', e.target.value)} placeholder="Excerpt" className="bg-secondary/60" rows={2} />
                <Textarea value={editor.meta_description} onChange={(e) => setField('meta_description', e.target.value)} placeholder="Meta description" className="bg-secondary/60" rows={2} />
                <div className="grid gap-4 md:grid-cols-2">
                  <Input value={editor.cover_image_url} onChange={(e) => setField('cover_image_url', e.target.value)} placeholder="Cover image URL" className="bg-secondary/60" />
                  <Input value={editor.cover_image_alt} onChange={(e) => setField('cover_image_alt', e.target.value)} placeholder="Cover image alt" className="bg-secondary/60" />
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  <ImagePreviewCard
                    label="Cover Image Preview"
                    url={editor.cover_image_url}
                    alt={editor.cover_image_alt || editor.title}
                  />
                  <ImagePreviewCard
                    label="Source Image Preview"
                    url={editor.source_image_url}
                    alt={editor.source_title || editor.title}
                    href={editor.source_url}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input value={editor.source_url} onChange={(e) => setField('source_url', e.target.value)} placeholder="Source URL" className="bg-secondary/60" />
                  <Input value={editor.source_title} onChange={(e) => setField('source_title', e.target.value)} placeholder="Source title" className="bg-secondary/60" />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <Input value={editor.source_site_name} onChange={(e) => setField('source_site_name', e.target.value)} placeholder="Source site name" className="bg-secondary/60" />
                  <Input value={editor.source_image_url} onChange={(e) => setField('source_image_url', e.target.value)} placeholder="Source image URL" className="bg-secondary/60" />
                  <Input value={editor.source_published_at} onChange={(e) => setField('source_published_at', e.target.value)} placeholder="Source published at (ISO)" className="bg-secondary/60" />
                </div>
                <Input value={editor.tags} onChange={(e) => setField('tags', e.target.value)} placeholder="Tags, comma separated" className="bg-secondary/60" />
                <Textarea value={editor.content} onChange={(e) => setField('content', e.target.value)} placeholder="Markdown content" className="min-h-[360px] bg-secondary/60" />
                <div className="flex gap-3">
                  <Button type="submit" disabled={saving} className="bg-cyan-500 hover:bg-cyan-400 text-slate-950">
                    {saving ? 'Saving...' : editor.id ? 'Update Post' : 'Publish Post'}
                  </Button>
                  {editor.id && (
                    <Button type="button" variant="destructive" onClick={() => deletePost(editor.id!)}>
                      Delete Post
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border bg-background/70 backdrop-blur">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-5">AI Blogger Posts</h2>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading posts...</p>
              ) : posts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No AI posts yet.</p>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => editPost(post)}
                      className="w-full rounded-2xl border border-border bg-secondary/40 p-4 text-left transition hover:bg-secondary/70"
                    >
                      <p className="font-medium leading-snug mb-2">{post.title}</p>
                      <p className="text-xs text-muted-foreground mb-3">
                        {new Date(post.created_at).toLocaleString()}
                      </p>
                      {post.tags?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <Badge key={`${post.id}-${tag}`} variant="outline" className="text-[11px]">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
