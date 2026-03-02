'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { TriviaQuestion } from '@/types/game'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Timer, Users, Crown, Copy, Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const TIMER_SECONDS = 20

interface GameRoom {
  id: string
  room_code: string
  host_id: string
  guest_id: string | null
  status: 'waiting' | 'playing' | 'finished'
  category: string
  questions: TriviaQuestion[]
  host_score: number
  guest_score: number
  host_answers: number[]
  guest_answers: number[]
  started_at: string | null
}

function TimerBar({ timeLeft, total }: { timeLeft: number; total: number }) {
  const pct = (timeLeft / total) * 100
  const color =
    timeLeft <= 5
      ? 'from-red-500 to-red-400'
      : timeLeft <= 10
      ? 'from-yellow-500 to-orange-400'
      : 'from-cyan-500 to-violet-500'
  return (
    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${color} transition-all duration-1000`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function MultiplayerRoom() {
  const { code } = useParams<{ code: string }>()
  const router = useRouter()

  const [room, setRoom] = useState<GameRoom | null>(null)
  const [myId, setMyId] = useState<string | null>(null)
  const [hostName, setHostName] = useState('Host')
  const [guestName, setGuestName] = useState('Guest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  // Local game state
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
  const [showExplanation, setShowExplanation] = useState(false)
  const [myScore, setMyScore] = useState(0)

  const answeredRef = useRef(false)
  const prevStatusRef = useRef<string>('')

  const isHost = myId === room?.host_id
  const questions: TriviaQuestion[] = room?.questions || []
  const question = questions[questionIndex]
  const myAnswers = room ? (isHost ? room.host_answers || [] : room.guest_answers || []) : []
  const opponentAnswers = room ? (isHost ? room.guest_answers || [] : room.host_answers || []) : []
  const myFinalScore = room ? (isHost ? room.host_score : room.guest_score) : 0
  const opponentScore = room ? (isHost ? room.guest_score : room.host_score) : 0
  const myName = isHost ? hostName : guestName
  const opponentName = isHost ? guestName : hostName
  const allMyAnswersDone = myAnswers.length >= questions.length && questions.length > 0

  async function fetchNames(hostId: string, guestId: string | null) {
    const supabase = createClient()
    const ids = [hostId, ...(guestId ? [guestId] : [])]
    const { data } = await supabase
      .from('profiles')
      .select('id, display_name, username')
      .in('id', ids)
    if (!data) return
    const h = data.find((p) => p.id === hostId)
    const g = guestId ? data.find((p) => p.id === guestId) : null
    if (h) setHostName(h.display_name || h.username)
    if (g) setGuestName(g.display_name || g.username)
  }

  // Initial load + join
  useEffect(() => {
    const supabase = createClient()
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setMyId(user.id)

      const joinRes = await fetch('/api/multiplayer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, action: 'join' }),
      })
      const joinData = await joinRes.json()
      if (!joinRes.ok) {
        setError(joinData.error || 'Failed to join room')
        setLoading(false)
        return
      }

      const roomRes = await fetch(`/api/multiplayer?code=${code}`)
      if (!roomRes.ok) { setError('Room not found'); setLoading(false); return }
      const roomData: GameRoom = await roomRes.json()
      setRoom(roomData)
      prevStatusRef.current = roomData.status
      fetchNames(roomData.host_id, roomData.guest_id)

      // Resume if already playing
      if (roomData.status === 'playing') {
        const mine = user.id === roomData.host_id
          ? roomData.host_answers || []
          : roomData.guest_answers || []
        const score = mine.reduce((sum: number, ans: number, idx: number) => {
          const q = roomData.questions[idx]
          return sum + (q && ans === q.correctIndex ? 10 : 0)
        }, 0)
        setMyScore(score)
        setQuestionIndex(mine.length < roomData.questions.length ? mine.length : mine.length)
        answeredRef.current = false
      }

      setLoading(false)
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`room:${code}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'game_rooms', filter: `room_code=eq.${code}` },
        (payload) => {
          const updated = payload.new as GameRoom
          setRoom(updated)
          if (updated.host_id) fetchNames(updated.host_id, updated.guest_id)

          // Transition: waiting → playing
          if (updated.status === 'playing' && prevStatusRef.current === 'waiting') {
            setQuestionIndex(0)
            setSelectedAnswer(null)
            setTimeLeft(TIMER_SECONDS)
            setShowExplanation(false)
            setMyScore(0)
            answeredRef.current = false
          }
          prevStatusRef.current = updated.status
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [code]) // eslint-disable-line react-hooks/exhaustive-deps

  const submitAnswer = useCallback(
    async (answerIndex: number) => {
      if (answeredRef.current) return
      answeredRef.current = true
      setSelectedAnswer(answerIndex)
      setShowExplanation(true)

      const res = await fetch('/api/multiplayer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, action: 'answer', answer_index: answerIndex }),
      })
      const data = await res.json()
      if (res.ok && data.score !== undefined) setMyScore(data.score)
    },
    [code]
  )

  const nextQuestion = useCallback(() => {
    const next = questionIndex + 1
    setQuestionIndex(next)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setTimeLeft(TIMER_SECONDS)
    answeredRef.current = false
  }, [questionIndex])

  const handleAnswer = useCallback(
    (i: number) => {
      if (room?.status !== 'playing' || selectedAnswer !== null || answeredRef.current) return
      submitAnswer(i)
    },
    [room?.status, selectedAnswer, submitAnswer]
  )

  // Timer
  useEffect(() => {
    if (room?.status !== 'playing' || allMyAnswersDone || selectedAnswer !== null) return
    if (timeLeft <= 0) { submitAnswer(-1); return }
    const t = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000)
    return () => clearTimeout(t)
  }, [room?.status, allMyAnswersDone, selectedAnswer, timeLeft, submitAnswer])

  async function handleStart() {
    await fetch('/api/multiplayer', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, action: 'start' }),
    })
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-4 animate-pulse">
          <Users className="w-8 h-8 text-white" />
        </div>
        <p className="text-muted-foreground">Joining room...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <Link href="/game/multiplayer">
          <Button variant="outline">← Back to Lobby</Button>
        </Link>
      </div>
    )
  }

  if (!room) return null

  // ─── WAITING ───
  if (room.status === 'waiting') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Waiting Room</h2>
        <p className="text-muted-foreground mb-8">Share the code with your opponent</p>

        <div className="bg-secondary/50 border border-border rounded-2xl p-6 mb-6">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Room Code</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl font-mono font-bold tracking-[0.3em] gradient-text">{code}</span>
            <button
              onClick={copyCode}
              className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-secondary/40 border border-border rounded-xl p-4">
            <Crown className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
            <p className="text-sm font-semibold truncate">{hostName}</p>
            <p className="text-xs text-muted-foreground">Host</p>
          </div>
          <div
            className={cn(
              'border rounded-xl p-4 transition-all',
              room.guest_id
                ? 'bg-secondary/40 border-border'
                : 'bg-secondary/20 border-dashed border-border/50'
            )}
          >
            {room.guest_id ? (
              <>
                <Users className="w-5 h-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-sm font-semibold truncate">{guestName}</p>
                <p className="text-xs text-muted-foreground">Challenger</p>
              </>
            ) : (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30 mx-auto mb-1 animate-pulse" />
                <p className="text-sm text-muted-foreground">Waiting...</p>
                <p className="text-xs text-muted-foreground">Challenger</p>
              </>
            )}
          </div>
        </div>

        {isHost ? (
          <Button
            onClick={handleStart}
            disabled={!room.guest_id}
            size="lg"
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 h-12 gap-2"
          >
            {room.guest_id ? '🚀 Start Game' : 'Waiting for opponent...'}
          </Button>
        ) : (
          <p className="text-muted-foreground text-sm animate-pulse">
            {room.guest_id ? 'Waiting for host to start...' : 'Joining room...'}
          </p>
        )}
      </div>
    )
  }

  // ─── FINISHED ───
  if (room.status === 'finished') {
    const iWon = myFinalScore > opponentScore
    const tied = myFinalScore === opponentScore
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">{tied ? '🤝' : iWon ? '🏆' : '😤'}</div>
        <h2 className="text-3xl font-bold mb-2">
          {tied ? "It's a Tie!" : iWon ? 'You Won!' : 'You Lost!'}
        </h2>
        <p className="text-muted-foreground mb-8">Room {code} — Final Results</p>

        <Card className="border-border bg-secondary/30 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 items-center text-center">
              <div>
                <p className="text-3xl font-bold gradient-text">{myFinalScore}</p>
                <p className="text-xs text-muted-foreground truncate">{myName} (you)</p>
              </div>
              <div className="text-muted-foreground font-bold text-lg">vs</div>
              <div>
                <p className="text-3xl font-bold text-cyan-400">{opponentScore}</p>
                <p className="text-xs text-muted-foreground truncate">{opponentName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Link href="/game/multiplayer">
            <Button className="bg-violet-600 hover:bg-violet-500 text-white border-0">
              Play Again
            </Button>
          </Link>
          <Link href="/game">
            <Button variant="outline">Solo Game</Button>
          </Link>
        </div>
      </div>
    )
  }

  // ─── WAITING FOR OPPONENT AFTER FINISHING ───
  if (allMyAnswersDone) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Timer className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold mb-2">Waiting for {opponentName}...</h2>
        <p className="text-muted-foreground">Your score: {myScore} pts</p>
        <p className="text-sm text-muted-foreground mt-1">
          {opponentName} has answered {opponentAnswers.length}/{questions.length} questions
        </p>
      </div>
    )
  }

  // ─── PLAYING ───
  if (!question) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Score header */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant="outline" className="gap-1">
          <Trophy className="w-3 h-3" />
          You: {myScore}
        </Badge>
        <div className="flex items-center gap-2">
          <Timer className={cn('w-4 h-4', timeLeft <= 5 ? 'text-red-400' : 'text-muted-foreground')} />
          <span
            className={cn(
              'text-sm font-mono font-bold',
              timeLeft <= 5 ? 'text-red-400' : timeLeft <= 10 ? 'text-yellow-400' : 'text-muted-foreground'
            )}
          >
            {timeLeft}s
          </span>
        </div>
        <Badge variant="outline" className="gap-1 text-cyan-400 border-cyan-500/30">
          <Users className="w-3 h-3" />
          {opponentName}: {opponentScore}
        </Badge>
      </div>

      <TimerBar timeLeft={timeLeft} total={TIMER_SECONDS} />

      <div className="mt-2 mb-6">
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
            style={{ width: `${(questionIndex / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {questionIndex + 1} / {questions.length}
        </p>
      </div>

      {/* Question */}
      <Card className="border-border bg-secondary/30 mb-5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🧠</span>
            <p className="text-lg font-semibold leading-snug">{question.question}</p>
          </div>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-3 mb-5">
        {question.options.map((option, i) => {
          const isSelected = selectedAnswer === i
          const isCorrect = i === question.correctIndex
          const isAnswered = selectedAnswer !== null

          let cls =
            'w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 text-sm font-medium'
          if (!isAnswered) {
            cls += ' border-border bg-secondary/50 hover:bg-secondary hover:border-primary/50 cursor-pointer'
          } else if (isCorrect) {
            cls += ' border-green-500 bg-green-500/20 text-green-300'
          } else if (isSelected && !isCorrect) {
            cls += ' border-red-500 bg-red-500/20 text-red-300'
          } else {
            cls += ' border-border bg-secondary/30 opacity-50'
          }

          return (
            <button key={i} onClick={() => handleAnswer(i)} disabled={isAnswered} className={cls}>
              <span
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  isAnswered && isCorrect
                    ? 'bg-green-500 text-white'
                    : isAnswered && isSelected && !isCorrect
                    ? 'bg-red-500 text-white'
                    : 'bg-secondary text-muted-foreground'
                )}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {option}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <Card className="border-border bg-secondary/20 mb-5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
              Explanation
            </p>
            <p className="text-sm leading-relaxed">{question.explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Next */}
      {selectedAnswer !== null && (
        <Button
          onClick={nextQuestion}
          className="w-full gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0"
        >
          {questionIndex + 1 >= questions.length ? 'Finish' : 'Next Question'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
