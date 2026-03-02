import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { awardPoints, checkAndAwardBadges } from '@/lib/badges'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { post_id, content, parent_id } = await request.json()

    if (!post_id || !content) {
      return NextResponse.json({ error: 'post_id and content required' }, { status: 400 })
    }

    if (content.length < 1 || content.length > 2000) {
      return NextResponse.json({ error: 'Comment must be 1-2000 characters' }, { status: 400 })
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        post_id,
        author_id: user.id,
        content: content.trim(),
        parent_id: parent_id || null,
      })
      .select(`
        *,
        author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url)
      `)
      .single()

    if (error) throw error

    // Award 1 point for commenting + check badges
    awardPoints(user.id, 1, 'leave_comment', supabase)
    checkAndAwardBadges(user.id, supabase)

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error('Comments POST error:', error)
    return NextResponse.json({ error: 'Failed to add comment' }, { status: 500 })
  }
}
