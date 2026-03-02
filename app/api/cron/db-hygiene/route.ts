import { NextResponse } from 'next/server'
import { verifyCronAuth, getServiceSupabase } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  try {
    const supabase = getServiceSupabase()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString()

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setUTCDate(ninetyDaysAgo.getUTCDate() - 90)
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString()

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString()

    // Hard-delete soft-deleted posts older than 30 days (cascades to comments/likes)
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .delete()
      .eq('is_deleted', true)
      .lt('updated_at', thirtyDaysAgoStr)
      .select('id')

    if (postsError) throw new Error(`posts: ${postsError.message}`)

    // Hard-delete soft-deleted comments older than 30 days
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .delete()
      .eq('is_deleted', true)
      .lt('updated_at', thirtyDaysAgoStr)
      .select('id')

    if (commentsError) throw new Error(`comments: ${commentsError.message}`)

    // Purge old point transactions (balance lives in profiles.points)
    const { data: txData, error: txError } = await supabase
      .from('point_transactions')
      .delete()
      .lt('created_at', ninetyDaysAgoStr)
      .select('id')

    if (txError) throw new Error(`point_transactions: ${txError.message}`)

    // Delete finished game rooms older than 7 days
    const { data: roomsData, error: roomsError } = await supabase
      .from('game_rooms')
      .delete()
      .eq('status', 'finished')
      .lt('finished_at', sevenDaysAgoStr)
      .select('id')

    if (roomsError) throw new Error(`game_rooms: ${roomsError.message}`)

    return NextResponse.json({
      success: true,
      postsDeleted: postsData?.length ?? 0,
      commentsDeleted: commentsData?.length ?? 0,
      transactionsPurged: txData?.length ?? 0,
      roomsCleaned: roomsData?.length ?? 0,
    })
  } catch (err) {
    console.error('db-hygiene cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
