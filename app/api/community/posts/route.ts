import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAndAwardBadges, awardPoints } from '@/lib/badges'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    const sort = searchParams.get('sort') || 'new'
    const offset = (page - 1) * limit

    let query = supabase
      .from('posts')
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url),
        likes:likes(count),
        comments:comments(count)
      `)
      .eq('is_deleted', false)
      .range(offset, offset + limit - 1)

    if (tag) {
      query = query.contains('tags', [tag])
    }

    if (sort === 'top') {
      // Sorting by likes requires a different approach
      query = query.order('created_at', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    const { data: posts, error } = await query

    if (error) throw error

    // Get current user for like status
    const { data: { user } } = await supabase.auth.getUser()

    let userLikes: string[] = []
    if (user && posts && posts.length > 0) {
      const postIds = posts.map((p: Record<string, unknown>) => p.id)
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds)
        .is('comment_id', null)
      userLikes = (likes || []).map((l: Record<string, unknown>) => l.post_id as string)
    }

    const enrichedPosts = (posts || []).map((post: Record<string, unknown>) => ({
      ...post,
      like_count: ((post.likes as Array<{ count: number }>)?.[0]?.count) || 0,
      comment_count: ((post.comments as Array<{ count: number }>)?.[0]?.count) || 0,
      user_liked: userLikes.includes(post.id as string),
    }))

    return NextResponse.json(enrichedPosts)
  } catch (error) {
    console.error('Community posts GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Ensure profile exists (handles cases where trigger failed on signup)
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      const emailPrefix = (user.email || '').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'user'
      const fallbackUsername = `${emailPrefix}_${user.id.substring(0, 8)}`
      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        username: fallbackUsername,
        display_name: user.user_metadata?.full_name || emailPrefix,
      })
      if (profileError) {
        console.error('Profile creation error:', profileError)
        return NextResponse.json(
          { error: `Profile setup failed: ${profileError.message}` },
          { status: 500 }
        )
      }
    }

    const { title, content, tags } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
    }

    if (title.length < 5 || title.length > 200) {
      return NextResponse.json({ error: 'Title must be 5-200 characters' }, { status: 400 })
    }

    if (content.length < 10 || content.length > 10000) {
      return NextResponse.json({ error: 'Content must be 10-10000 characters' }, { status: 400 })
    }

    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        author_id: user.id,
        title: title.trim(),
        content: content.trim(),
        tags: Array.isArray(tags) ? tags.slice(0, 5) : [],
      })
      .select(`
        *,
        author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Award points + check badges (fire-and-forget)
    awardPoints(user.id, 5, 'create_post', supabase)
    checkAndAwardBadges(user.id, supabase)

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Community posts POST error:', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
