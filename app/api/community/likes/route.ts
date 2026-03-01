import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { post_id, comment_id } = await request.json()

    if (!post_id && !comment_id) {
      return NextResponse.json({ error: 'post_id or comment_id required' }, { status: 400 })
    }

    // Check if already liked
    const checkQuery = post_id
      ? supabase.from('likes').select('id').eq('user_id', user.id).eq('post_id', post_id).is('comment_id', null)
      : supabase.from('likes').select('id').eq('user_id', user.id).eq('comment_id', comment_id).is('post_id', null)

    const { data: existing } = await checkQuery.maybeSingle()

    if (existing) {
      // Unlike
      await supabase.from('likes').delete().eq('id', existing.id)

      // Get new count
      const countQuery = post_id
        ? supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post_id).is('comment_id', null)
        : supabase.from('likes').select('id', { count: 'exact' }).eq('comment_id', comment_id).is('post_id', null)

      const { count } = await countQuery
      return NextResponse.json({ liked: false, count: count || 0 })
    } else {
      // Like
      await supabase.from('likes').insert({
        user_id: user.id,
        post_id: post_id || null,
        comment_id: comment_id || null,
      })

      const countQuery = post_id
        ? supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', post_id).is('comment_id', null)
        : supabase.from('likes').select('id', { count: 'exact' }).eq('comment_id', comment_id).is('post_id', null)

      const { count } = await countQuery
      return NextResponse.json({ liked: true, count: count || 0 })
    }
  } catch (error) {
    console.error('Likes POST error:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
