import type { SupabaseClient } from '@supabase/supabase-js'

export async function checkAndAwardBadges(
  userId: string,
  supabase: SupabaseClient,
  hints?: {
    newPostCount?: number
    newStreak?: number
    newPoints?: number
    newCommentCount?: number
    apiKeyCreated?: boolean
    multiplayerWin?: boolean
    perfectScore?: boolean
  }
): Promise<string[]> {
  const [profileResult, postCountResult, commentCountResult, existingBadgesResult] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('streak_count, points, total_games_played')
        .eq('id', userId)
        .single(),
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId)
        .eq('is_deleted', false),
      supabase
        .from('comments')
        .select('id', { count: 'exact', head: true })
        .eq('author_id', userId),
      supabase.from('user_badges').select('badge_id').eq('user_id', userId),
    ])

  const earned = new Set(
    (existingBadgesResult.data || []).map((b: { badge_id: string }) => b.badge_id)
  )
  const toAward: string[] = []

  const posts = postCountResult.count ?? 0
  const comments = commentCountResult.count ?? 0
  const streak = hints?.newStreak ?? profileResult.data?.streak_count ?? 0
  const points = hints?.newPoints ?? profileResult.data?.points ?? 0

  // Post badges
  if (posts >= 1 && !earned.has('first_post')) toAward.push('first_post')
  if (posts >= 10 && !earned.has('post_10')) toAward.push('post_10')
  if (posts >= 50 && !earned.has('post_50')) toAward.push('post_50')

  // Streak badges
  if (streak >= 3 && !earned.has('streak_3')) toAward.push('streak_3')
  if (streak >= 7 && !earned.has('streak_7')) toAward.push('streak_7')
  if (streak >= 30 && !earned.has('streak_30')) toAward.push('streak_30')

  // Points badges
  if (points >= 1000 && !earned.has('points_1000')) toAward.push('points_1000')
  if (points >= 10000 && !earned.has('points_10000')) toAward.push('points_10000')

  // Comment badges
  if (comments >= 50 && !earned.has('comment_50')) toAward.push('comment_50')

  // Special badges from hints
  if (hints?.apiKeyCreated && !earned.has('api_user')) toAward.push('api_user')
  if (hints?.multiplayerWin && !earned.has('multiplayer_1')) toAward.push('multiplayer_1')
  if (hints?.perfectScore && !earned.has('trivia_expert')) toAward.push('trivia_expert')

  if (toAward.length > 0) {
    await supabase.from('user_badges').insert(
      toAward.map((badge_id) => ({ user_id: userId, badge_id }))
    )
  }

  return toAward
}

export async function awardPoints(
  userId: string,
  amount: number,
  reason: string,
  supabase: SupabaseClient
): Promise<number> {
  const [{ data: profile }, insertResult] = await Promise.all([
    supabase.from('profiles').select('points').eq('id', userId).single(),
    supabase
      .from('point_transactions')
      .insert({ user_id: userId, amount, reason }),
  ])

  if (insertResult.error) return 0

  const currentPoints = profile?.points ?? 0
  const newPoints = currentPoints + amount

  await supabase.from('profiles').update({ points: newPoints }).eq('id', userId)
  return newPoints
}
