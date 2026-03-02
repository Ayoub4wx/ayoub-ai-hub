import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateApiKey } from '@/lib/api-key'
import { checkAndAwardBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

// GET /api/developer/keys — list user's API keys
export async function GET() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: keys, error } = await supabase
    .from('api_keys')
    .select('id, key_prefix, name, plan, daily_limit, requests_today, total_requests, is_active, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(keys || [])
}

// POST /api/developer/keys — create new API key
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const name = (body.name as string)?.trim().slice(0, 60) || 'My API Key'

  // Check key limit (max 5 keys per user)
  const { count } = await supabase
    .from('api_keys')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_active', true)

  if ((count ?? 0) >= 5) {
    return NextResponse.json({ error: 'Maximum of 5 API keys allowed' }, { status: 400 })
  }

  // Ensure profile exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    const emailPrefix = (user.email || '').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
    await supabase.from('profiles').insert({
      id: user.id,
      username: `${emailPrefix}_${user.id.substring(0, 8)}`,
      display_name: user.user_metadata?.full_name || emailPrefix,
    })
  }

  const { fullKey, prefix, hash } = generateApiKey()

  const { data: apiKey, error } = await supabase
    .from('api_keys')
    .insert({
      user_id: user.id,
      key_prefix: prefix,
      key_hash: hash,
      name,
      plan: 'free',
      daily_limit: 50,
    })
    .select('id, key_prefix, name, plan, daily_limit, requests_today, total_requests, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Award Developer badge if this is their first key
  await checkAndAwardBadges(user.id, supabase, { apiKeyCreated: true })

  // Return full key ONCE — never stored, only the hash is saved
  return NextResponse.json({ ...apiKey, full_key: fullKey }, { status: 201 })
}

// DELETE /api/developer/keys?id=xxx — revoke a key
export async function DELETE(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing key id' }, { status: 400 })

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
