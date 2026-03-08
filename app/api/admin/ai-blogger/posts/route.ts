import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient, getOrCreateAiBloggerProfileId, isAiBloggerAdminAuthenticated } from '@/lib/ai-blogger-admin'

function sanitizeTags(tags: unknown) {
  if (!Array.isArray(tags)) return []
  return tags
    .map((tag) => String(tag).trim().replace(/^#/, ''))
    .filter(Boolean)
    .filter((tag, index, all) => all.indexOf(tag) === index)
    .slice(0, 5)
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET() {
  if (!isAiBloggerAdminAuthenticated()) return unauthorized()

  const supabase = createServiceRoleClient()
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url)
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const filtered = (posts || []).filter((post) => post.author?.username === 'ai_blogger')
  return NextResponse.json(filtered)
}

export async function POST(request: NextRequest) {
  if (!isAiBloggerAdminAuthenticated()) return unauthorized()

  const supabase = createServiceRoleClient()
  const botId = await getOrCreateAiBloggerProfileId(supabase)
  const body = await request.json().catch(() => ({}))

  const title = String(body.title || '').trim()
  const content = String(body.content || '').trim()
  if (title.length < 5 || content.length < 10) {
    return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: botId,
      title: title.slice(0, 200),
      content: content.slice(0, 10000),
      excerpt: String(body.excerpt || '').trim() || null,
      meta_description: String(body.meta_description || '').trim() || null,
      cover_image_url: String(body.cover_image_url || '').trim() || null,
      cover_image_alt: String(body.cover_image_alt || '').trim() || null,
      source_url: String(body.source_url || '').trim() || null,
      source_title: String(body.source_title || '').trim() || null,
      source_site_name: String(body.source_site_name || '').trim() || null,
      source_image_url: String(body.source_image_url || '').trim() || null,
      source_published_at: String(body.source_published_at || '').trim() || null,
      tags: sanitizeTags(body.tags),
    })
    .select(`
      *,
      author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url)
    `)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
