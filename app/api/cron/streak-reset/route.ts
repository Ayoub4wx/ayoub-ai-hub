import { NextResponse } from 'next/server'
import { verifyCronAuth, getServiceSupabase } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  try {
    const supabase = getServiceSupabase()

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const yesterday = new Date(today)
    yesterday.setUTCDate(yesterday.getUTCDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    let shieldsConsumed = 0
    let streaksReset = 0
    let processed = 0
    let offset = 0
    const batchSize = 100

    while (true) {
      const { data: stale, error } = await supabase
        .from('profiles')
        .select('id, streak_count, streak_shield')
        .lt('last_game_date', yesterdayStr)
        .gt('streak_count', 0)
        .range(offset, offset + batchSize - 1)

      if (error) throw new Error(error.message)
      if (!stale || stale.length === 0) break

      for (const profile of stale) {
        if (profile.streak_shield) {
          await supabase
            .from('profiles')
            .update({ streak_shield: false })
            .eq('id', profile.id)
          shieldsConsumed++
        } else {
          await supabase
            .from('profiles')
            .update({ streak_count: 0 })
            .eq('id', profile.id)
          streaksReset++
        }
        processed++
      }

      if (stale.length < batchSize) break
      offset += batchSize
    }

    return NextResponse.json({ success: true, shieldsConsumed, streaksReset, processed })
  } catch (err) {
    console.error('streak-reset cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
