import { NextResponse } from 'next/server'
import { verifyCronAuth, getServiceSupabase } from '@/lib/cron-auth'
import { checkAndAwardBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  try {
    const supabase = getServiceSupabase()

    let usersProcessed = 0
    let totalBadgesAwarded = 0
    let offset = 0
    const batchSize = 50

    while (true) {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id')
        .neq('username', 'ai_blogger')
        .range(offset, offset + batchSize - 1)

      if (error) throw new Error(error.message)
      if (!profiles || profiles.length === 0) break

      for (const profile of profiles) {
        const awarded = await checkAndAwardBadges(profile.id, supabase)
        totalBadgesAwarded += awarded.length
        usersProcessed++
      }

      // Throttle to avoid hitting Supabase free-tier limits
      if (profiles.length === batchSize) {
        await new Promise((r) => setTimeout(r, 50))
      }

      if (profiles.length < batchSize) break
      offset += batchSize
    }

    return NextResponse.json({ success: true, usersProcessed, totalBadgesAwarded })
  } catch (err) {
    console.error('badge-sweep cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
