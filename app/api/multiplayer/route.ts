import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdmin } from '@supabase/supabase-js'
import { TRIVIA_QUESTIONS, shuffleQuestions } from '@/lib/trivia-questions'
import { TriviaQuestion } from '@/types/game'

export const dynamic = 'force-dynamic'

function createAdminClient() {
  return createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

// POST /api/multiplayer — create room
export async function POST(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const category = body.category || 'all'

  let pool = TRIVIA_QUESTIONS
  if (category !== 'all') {
    const filtered = TRIVIA_QUESTIONS.filter((q) => q.category === category)
    if (filtered.length >= 10) pool = filtered
  }
  const questions = shuffleQuestions(pool, 10)

  const admin = createAdminClient()
  let code = generateCode()
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await admin
      .from('game_rooms')
      .select('id')
      .eq('room_code', code)
      .maybeSingle()
    if (!existing) break
    code = generateCode()
  }

  const { data: room, error } = await admin
    .from('game_rooms')
    .insert({ room_code: code, host_id: user.id, category, questions, status: 'waiting' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ room_code: code, room })
}

// GET /api/multiplayer?code=XXX — fetch room
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')?.toUpperCase().trim()
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  const admin = createAdminClient()
  const { data: room } = await admin
    .from('game_rooms')
    .select('*')
    .eq('room_code', code)
    .single()

  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  return NextResponse.json(room)
}

// PATCH /api/multiplayer — join | start | answer
export async function PATCH(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const body = await request.json().catch(() => ({}))
  const { code, action } = body

  const { data: room } = await admin
    .from('game_rooms')
    .select('*')
    .eq('room_code', code)
    .single()

  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

  if (action === 'join') {
    if (room.host_id === user.id) return NextResponse.json({ role: 'host' })
    if (room.guest_id === user.id) return NextResponse.json({ role: 'guest' })
    if (room.guest_id) return NextResponse.json({ error: 'Room is full' }, { status: 400 })
    if (room.status !== 'waiting') return NextResponse.json({ error: 'Game already started' }, { status: 400 })

    await admin.from('game_rooms').update({ guest_id: user.id }).eq('room_code', code)
    return NextResponse.json({ role: 'guest' })
  }

  if (action === 'start') {
    if (room.host_id !== user.id) return NextResponse.json({ error: 'Only host can start' }, { status: 403 })
    if (!room.guest_id) return NextResponse.json({ error: 'Waiting for opponent' }, { status: 400 })

    await admin.from('game_rooms').update({
      status: 'playing',
      started_at: new Date().toISOString(),
    }).eq('room_code', code)
    return NextResponse.json({ ok: true })
  }

  if (action === 'answer') {
    const { answer_index } = body
    const isHost = room.host_id === user.id
    const isGuest = room.guest_id === user.id
    if (!isHost && !isGuest) return NextResponse.json({ error: 'Not in room' }, { status: 403 })

    const answersKey = isHost ? 'host_answers' : 'guest_answers'
    const scoreKey = isHost ? 'host_score' : 'guest_score'
    const currentAnswers: number[] = (isHost ? room.host_answers : room.guest_answers) || []
    const newAnswers = [...currentAnswers, answer_index]

    const questions: TriviaQuestion[] = room.questions
    const newScore = newAnswers.reduce((sum, ans, idx) => {
      const q = questions[idx]
      return sum + (q && ans === q.correctIndex ? 10 : 0)
    }, 0)

    const otherAnswers: number[] = (isHost ? room.guest_answers : room.host_answers) || []
    const totalQ = questions.length
    const bothDone = newAnswers.length >= totalQ && otherAnswers.length >= totalQ

    await admin.from('game_rooms').update({
      [answersKey]: newAnswers,
      [scoreKey]: newScore,
      ...(bothDone ? { status: 'finished', finished_at: new Date().toISOString() } : {}),
    }).eq('room_code', code)

    return NextResponse.json({ ok: true, score: newScore, finished: bothDone })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}
