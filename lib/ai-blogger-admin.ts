import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import { createClient } from '@supabase/supabase-js'

export const AI_BLOGGER_ADMIN_COOKIE = 'ai_blogger_admin_session'
const BOT_USERNAME = 'ai_blogger'
const BOT_EMAIL = 'ai.blogger@aihub.internal'
const BOT_DISPLAY_NAME = 'AI Blogger'
const BOT_BIO = 'Automated AI news analysis. Powered by free LLMs via OpenRouter. Posts daily insights from across the AI web.'
const BOT_AVATAR = 'https://api.dicebear.com/7.x/bottts/svg?seed=ai-blogger&backgroundColor=6d28d9'

export function getAiBloggerAdminPassword() {
  return process.env.AI_BLOGGER_ADMIN_PASSWORD || process.env.ADMIN_PANEL_PASSWORD || ''
}

export function getAiBloggerAdminToken() {
  const password = getAiBloggerAdminPassword()
  return password ? createHash('sha256').update(password).digest('hex') : ''
}

export function isAiBloggerAdminAuthenticated() {
  const expected = getAiBloggerAdminToken()
  if (!expected) return false
  return cookies().get(AI_BLOGGER_ADMIN_COOKIE)?.value === expected
}

export function createServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getOrCreateAiBloggerProfileId(supabase = createServiceRoleClient() as any): Promise<string> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', BOT_USERNAME)
    .maybeSingle()

  if (existing?.id) return existing.id as string

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: BOT_EMAIL,
    password: crypto.randomUUID(),
    email_confirm: true,
  })

  if (authError || !authData?.user) {
    throw new Error(`Bot auth user creation failed: ${authError?.message}`)
  }

  const botId = authData.user.id
  await new Promise((resolve) => setTimeout(resolve, 500))

  await supabase.from('profiles').upsert({
    id: botId,
    username: BOT_USERNAME,
    display_name: BOT_DISPLAY_NAME,
    bio: BOT_BIO,
    avatar_url: BOT_AVATAR,
  })

  return botId
}
