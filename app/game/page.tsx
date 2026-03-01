'use client'

import { useState, useEffect, useCallback } from 'react'
import { TriviaQuestion, GameState } from '@/types/game'
import { Trophy, Timer, Zap, RotateCcw, Share2, ChevronRight, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const TIMER_SECONDS = 20
const QUESTIONS_PER_GAME = 10

function ProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-500"
        style={{ width: `${(current / total) * 100}%` }}
      />
    </div>
  )
}

function TimerBar({ timeLeft, total }: { timeLeft: number; total: number }) {
  const pct = (timeLeft / total) * 100
  const color = timeLeft <= 5 ? 'from-red-500 to-red-400' : timeLeft <= 10 ? 'from-yellow-500 to-orange-400' : 'from-cyan-500 to-violet-500'
  return (
    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${color} transition-all duration-1000`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function GamePage() {
  const [state, setState] = useState<GameState>({
    status: 'idle',
    questions: [],
    currentIndex: 0,
    score: 0,
    streak: 0,
    selectedAnswer: null,
    timeLeft: TIMER_SECONDS,
  })
  const [bestScore, setBestScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('aiTriviaBestScore')
    if (saved) setBestScore(parseInt(saved))
  }, [])

  const startGame = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/game?count=${QUESTIONS_PER_GAME}`)
      const questions: TriviaQuestion[] = await res.json()
      setState({
        status: 'playing',
        questions,
        currentIndex: 0,
        score: 0,
        streak: 0,
        selectedAnswer: null,
        timeLeft: TIMER_SECONDS,
      })
      setShowExplanation(false)
    } catch (err) {
      console.error('Failed to load questions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswer = useCallback((answerIndex: number) => {
    if (state.status !== 'playing' || state.selectedAnswer !== null) return

    const question = state.questions[state.currentIndex]
    const isCorrect = answerIndex === question.correctIndex
    const newScore = isCorrect ? state.score + (state.streak >= 2 ? 15 : 10) : state.score
    const newStreak = isCorrect ? state.streak + 1 : 0

    setState((prev) => ({
      ...prev,
      status: 'answered',
      selectedAnswer: answerIndex,
      score: newScore,
      streak: newStreak,
    }))
    setShowExplanation(true)
  }, [state])

  const nextQuestion = useCallback(() => {
    const nextIndex = state.currentIndex + 1
    if (nextIndex >= state.questions.length) {
      // Game over
      if (state.score > bestScore) {
        setBestScore(state.score)
        localStorage.setItem('aiTriviaBestScore', state.score.toString())
      }
      setState((prev) => ({ ...prev, status: 'finished' }))
    } else {
      setState((prev) => ({
        ...prev,
        status: 'playing',
        currentIndex: nextIndex,
        selectedAnswer: null,
        timeLeft: TIMER_SECONDS,
      }))
      setShowExplanation(false)
    }
  }, [state, bestScore])

  // Timer countdown
  useEffect(() => {
    if (state.status !== 'playing') return
    if (state.timeLeft <= 0) {
      handleAnswer(-1) // Time's up — wrong answer
      return
    }
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, timeLeft: prev.timeLeft - 1 }))
    }, 1000)
    return () => clearTimeout(timer)
  }, [state.status, state.timeLeft, handleAnswer])

  const question = state.questions[state.currentIndex]
  const maxScore = QUESTIONS_PER_GAME * 15

  // ─── IDLE ───
  if (state.status === 'idle') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🧠</span>
        </div>
        <h1 className="text-4xl font-bold mb-3">
          AI <span className="gradient-text">Trivia</span>
        </h1>
        <p className="text-muted-foreground mb-6 text-lg">
          Test your AI & machine learning knowledge!
        </p>

        <div className="grid grid-cols-3 gap-4 mb-8 text-center">
          <div className="bg-secondary/50 border border-border rounded-xl p-4">
            <p className="text-2xl font-bold gradient-text">{QUESTIONS_PER_GAME}</p>
            <p className="text-xs text-muted-foreground">Questions</p>
          </div>
          <div className="bg-secondary/50 border border-border rounded-xl p-4">
            <p className="text-2xl font-bold gradient-text">{TIMER_SECONDS}s</p>
            <p className="text-xs text-muted-foreground">Per Question</p>
          </div>
          <div className="bg-secondary/50 border border-border rounded-xl p-4">
            <p className="text-2xl font-bold gradient-text">{bestScore}</p>
            <p className="text-xs text-muted-foreground">Best Score</p>
          </div>
        </div>

        <div className="bg-secondary/30 border border-border rounded-xl p-4 mb-8 text-left text-sm text-muted-foreground space-y-1.5">
          <p>✅ 10 points per correct answer</p>
          <p>🔥 Streak bonus: +5 points when on 2+ streak</p>
          <p>⏱ Answer before time runs out</p>
          <p>📚 Topics: Models, History, Companies, Concepts, Tools</p>
        </div>

        <Button
          onClick={startGame}
          disabled={loading}
          size="lg"
          className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 gap-2 h-12 px-8 text-base"
        >
          {loading ? 'Loading...' : '🎮 Start Game'}
        </Button>
      </div>
    )
  }

  // ─── FINISHED ───
  if (state.status === 'finished') {
    const percentage = Math.round((state.score / maxScore) * 100)
    const grade =
      percentage >= 90 ? { label: 'AI Expert!', emoji: '🏆', color: 'text-yellow-400' }
      : percentage >= 70 ? { label: 'AI Enthusiast!', emoji: '🌟', color: 'text-cyan-400' }
      : percentage >= 50 ? { label: 'Getting There!', emoji: '📚', color: 'text-violet-400' }
      : { label: 'Keep Learning!', emoji: '💪', color: 'text-muted-foreground' }

    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">{grade.emoji}</div>
        <h2 className={`text-3xl font-bold mb-2 ${grade.color}`}>{grade.label}</h2>
        <p className="text-muted-foreground mb-8">You scored {state.score} out of {maxScore} possible points</p>

        <Card className="border-border bg-secondary/30 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold gradient-text">{state.score}</div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">{bestScore}</div>
                <div className="text-xs text-muted-foreground">Best</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pink-400">{percentage}%</div>
                <div className="text-xs text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-center">
          <Button
            onClick={startGame}
            disabled={loading}
            className="gap-2 bg-violet-600 hover:bg-violet-500 text-white border-0"
          >
            <RotateCcw className="w-4 h-4" />
            Play Again
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const text = `I scored ${state.score}/${maxScore} on Ayoub's AI Trivia! 🧠 Can you beat me? Try it at ${window.location.origin}/game`
              if (navigator.share) {
                navigator.share({ title: 'AI Trivia Score', text })
              } else {
                navigator.clipboard.writeText(text)
              }
            }}
          >
            <Share2 className="w-4 h-4" />
            Share Score
          </Button>
        </div>
      </div>
    )
  }

  // ─── PLAYING / ANSWERED ───
  if (!question) return null

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Trophy className="w-3 h-3" />
            {state.score}
          </Badge>
          {state.streak >= 2 && (
            <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 gap-1">
              <Zap className="w-3 h-3" />
              {state.streak}x streak
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Timer className={cn('w-4 h-4', state.timeLeft <= 5 ? 'text-red-400' : 'text-muted-foreground')} />
          <span className={cn(
            'text-sm font-mono font-bold',
            state.timeLeft <= 5 ? 'text-red-400' : state.timeLeft <= 10 ? 'text-yellow-400' : 'text-muted-foreground'
          )}>
            {state.timeLeft}s
          </span>
        </div>
      </div>

      <TimerBar timeLeft={state.timeLeft} total={TIMER_SECONDS} />

      <div className="mt-2 mb-6">
        <ProgressBar current={state.currentIndex} total={state.questions.length} />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {state.currentIndex + 1} / {state.questions.length}
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
          const isSelected = state.selectedAnswer === i
          const isCorrect = i === question.correctIndex
          const isAnswered = state.status === 'answered'

          let className = 'w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 text-sm font-medium'

          if (!isAnswered) {
            className += ' border-border bg-secondary/50 hover:bg-secondary hover:border-primary/50 cursor-pointer'
          } else if (isCorrect) {
            className += ' border-green-500 bg-green-500/20 text-green-300'
          } else if (isSelected && !isCorrect) {
            className += ' border-red-500 bg-red-500/20 text-red-300'
          } else {
            className += ' border-border bg-secondary/30 opacity-50'
          }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={isAnswered}
              className={className}
            >
              <span className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                isAnswered && isCorrect ? 'bg-green-500 text-white'
                : isAnswered && isSelected && !isCorrect ? 'bg-red-500 text-white'
                : 'bg-secondary text-muted-foreground'
              )}>
                {String.fromCharCode(65 + i)}
              </span>
              {option}
              {isAnswered && isCorrect && <Star className="w-4 h-4 text-green-400 ml-auto" />}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showExplanation && (
        <Card className="border-border bg-secondary/20 mb-5">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">Explanation</p>
            <p className="text-sm leading-relaxed">{question.explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Next button */}
      {state.status === 'answered' && (
        <Button
          onClick={nextQuestion}
          className="w-full gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0"
        >
          {state.currentIndex + 1 >= state.questions.length ? 'See Results' : 'Next Question'}
          <ChevronRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}
