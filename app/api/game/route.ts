import { NextRequest, NextResponse } from 'next/server'
import { TRIVIA_QUESTIONS, shuffleQuestions } from '@/lib/trivia-questions'
import { createClient } from '@/lib/supabase/server'
import { checkAndAwardBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const count = Math.min(parseInt(searchParams.get('count') || '10'), 20)
  const category = searchParams.get('category') || 'all'

  let pool = TRIVIA_QUESTIONS
  if (category !== 'all') {
    pool = TRIVIA_QUESTIONS.filter((q) => q.category === category)
    if (pool.length < count) pool = TRIVIA_QUESTIONS // fallback to all if not enough
  }

  const questions = shuffleQuestions(pool, count)
  return NextResponse.json(questions)
}

// POST /api/game — save score, update streak, award points + badges
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const score: number = Math.min(Math.max(parseInt(body.score) || 0, 0), 150)

  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_count, streak_shield, last_game_date, points, best_trivia_score, total_games_played')
    .eq('id', user.id)
    .single()

  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const lastGameDate = profile.last_game_date

  // Already played today — return current state without awarding again
  if (lastGameDate === today) {
    return NextResponse.json({
      points_earned: 0,
      new_total: profile.points,
      streak: profile.streak_count,
      streak_bonus: 0,
      already_played: true,
    })
  }

  // Calculate new streak
  let newStreak = 1
  if (lastGameDate === yesterday) {
    newStreak = (profile.streak_count || 0) + 1
  } else if (profile.streak_shield && profile.streak_count >= 7) {
    // Grace period: had shield, use it
    newStreak = profile.streak_count
    await supabase.from('profiles').update({ streak_shield: false }).eq('id', user.id)
  }

  // Calculate points
  const basePoints = Math.floor(score / 10)  // 0-15 from score
  const dailyBonus = 25
  const streakBonus = Math.min(newStreak * 10, 70)
  const totalEarned = basePoints + dailyBonus + streakBonus

  const newBest = Math.max(score, profile.best_trivia_score || 0)
  const newTotal = (profile.points || 0) + totalEarned

  // Update profile
  await supabase.from('profiles').update({
    streak_count: newStreak,
    last_game_date: today,
    total_games_played: (profile.total_games_played || 0) + 1,
    best_trivia_score: newBest,
    points: newTotal,
    // Award streak shield at 7+ days
    streak_shield: newStreak >= 7 ? true : profile.streak_shield,
  }).eq('id', user.id)

  // Log point transaction
  await supabase.from('point_transactions').insert({
    user_id: user.id,
    amount: totalEarned,
    reason: `trivia_daily (score:${score}, streak:${newStreak})`,
  })

  // Check and award badges
  const newBadges = await checkAndAwardBadges(user.id, supabase, {
    newStreak,
    newPoints: newTotal,
    perfectScore: score === 150,
  })

  return NextResponse.json({
    points_earned: totalEarned,
    breakdown: { base: basePoints, daily_bonus: dailyBonus, streak_bonus: streakBonus },
    new_total: newTotal,
    streak: newStreak,
    best_score: newBest,
    new_badges: newBadges,
    already_played: false,
  })
}
