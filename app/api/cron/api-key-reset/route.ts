import { NextResponse } from 'next/server'
import { verifyCronAuth, getServiceSupabase } from '@/lib/cron-auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const authError = verifyCronAuth(request)
  if (authError) return authError

  try {
    const supabase = getServiceSupabase()
    const now = new Date().toISOString()

    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setUTCDate(ninetyDaysAgo.getUTCDate() - 90)
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString()

    // Reset daily request counts for all active keys
    const { data: resetData, error: resetError } = await supabase
      .from('api_keys')
      .update({ requests_today: 0, last_reset_at: now })
      .eq('is_active', true)
      .select('id')

    if (resetError) throw new Error(resetError.message)
    const resetCount = resetData?.length ?? 0

    // Deactivate stale keys that were never used and are 90+ days old
    const { data: deactivatedData, error: deactivateError } = await supabase
      .from('api_keys')
      .update({ is_active: false })
      .eq('is_active', true)
      .eq('total_requests', 0)
      .lt('created_at', ninetyDaysAgoStr)
      .select('id')

    if (deactivateError) throw new Error(deactivateError.message)
    const deactivatedCount = deactivatedData?.length ?? 0

    return NextResponse.json({
      success: true,
      resetCount,
      deactivatedCount,
    })
  } catch (err) {
    console.error('api-key-reset cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
