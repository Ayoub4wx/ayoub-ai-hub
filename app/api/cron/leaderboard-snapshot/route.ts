import { NextResponse } from 'next/server'
import { verifyCronAuth, getServiceSupabase } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

function getLastMonday(): string {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  const day = d.getUTCDay() // 0=Sun, 1=Mon...
  const diff = day === 0 ? 6 : day - 1 // Days since last Monday
  d.setUTCDate(d.getUTCDate() - diff)
  return d.toISOString().split('T')[0]
}

export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  try {
    const supabase = getServiceSupabase()
    const weekStart = getLastMonday()

    // Idempotency: skip if snapshot already exists for this week
    const { count: existing } = await supabase
      .from('leaderboard_snapshots')
      .select('id', { count: 'exact', head: true })
      .eq('week_start', weekStart)

    if (existing && existing > 0) {
      return NextResponse.json({ success: true, skipped: true, reason: 'Already snapshotted this week', weekStart })
    }

    // Fetch top 10 users by points (exclude bot accounts)
    const { data: top10, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, points')
      .neq('username', 'ai_blogger')
      .order('points', { ascending: false })
      .limit(10)

    if (profilesError) throw new Error(profilesError.message)
    if (!top10 || top10.length === 0) {
      return NextResponse.json({ success: true, snapshotted: 0, weekStart })
    }

    const rows = top10.map((profile, index) => ({
      week_start: weekStart,
      rank: index + 1,
      user_id: profile.id,
      points: profile.points,
      username: profile.username,
    }))

    const { error: insertError } = await supabase
      .from('leaderboard_snapshots')
      .insert(rows)

    if (insertError) throw new Error(insertError.message)

    return NextResponse.json({ success: true, weekStart, snapshotted: rows.length })
  } catch (err) {
    console.error('leaderboard-snapshot cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
