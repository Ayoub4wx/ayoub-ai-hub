import { NextResponse } from 'next/server'
import { verifyCronAuth, getServiceSupabase } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  try {
    const supabase = getServiceSupabase()
    const now = new Date()

    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    const finishedAt = now.toISOString()

    // Mark abandoned waiting/countdown rooms as finished
    const { data: waitingData, error: waitingError } = await supabase
      .from('game_rooms')
      .update({ status: 'finished', finished_at: finishedAt })
      .in('status', ['waiting', 'countdown'])
      .lt('created_at', twoHoursAgo)
      .select('id')

    if (waitingError) throw new Error(waitingError.message)

    // Mark stale playing rooms as finished (crashed games > 1hr)
    const { data: playingData, error: playingError } = await supabase
      .from('game_rooms')
      .update({ status: 'finished', finished_at: finishedAt })
      .eq('status', 'playing')
      .lt('started_at', oneHourAgo)
      .select('id')

    if (playingError) throw new Error(playingError.message)

    const abandonedRoomsMarked = (waitingData?.length ?? 0) + (playingData?.length ?? 0)

    return NextResponse.json({ success: true, abandonedRoomsMarked })
  } catch (err) {
    console.error('game-room-cleanup cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
