'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Users, Plus, LogIn } from 'lucide-react'
import Link from 'next/link'

const CATEGORIES = [
  { id: 'all', label: 'Random Mix', icon: '🎲' },
  { id: 'models', label: 'AI Models', icon: '🤖' },
  { id: 'concepts', label: 'Concepts', icon: '🧠' },
  { id: 'companies', label: 'Companies', icon: '🏢' },
  { id: 'history', label: 'History', icon: '📜' },
  { id: 'tools', label: 'Tools', icon: '🛠️' },
  { id: 'image_ai', label: 'Image AI', icon: '🎨' },
  { id: 'video_ai', label: 'Video AI', icon: '🎬' },
  { id: 'coding_ai', label: 'Coding AI', icon: '💻' },
  { id: 'ethics', label: 'AI Ethics', icon: '⚖️' },
  { id: 'math', label: 'Math & ML', icon: '📐' },
  { id: 'prompting', label: 'Prompting', icon: '✍️' },
]

export default function MultiplayerLobby() {
  const router = useRouter()
  const [tab, setTab] = useState<'create' | 'join'>('create')
  const [category, setCategory] = useState('all')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/multiplayer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) { router.push('/auth/login'); return }
        throw new Error(data.error || 'Failed to create room')
      }
      router.push(`/game/multiplayer/${data.room_code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin() {
    const code = joinCode.trim().toUpperCase()
    if (!code) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/multiplayer?code=${code}`)
      if (!res.ok) throw new Error('Room not found. Check the code and try again.')
      router.push(`/game/multiplayer/${code}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-6">
          <Users className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold mb-3">
          <span className="gradient-text">Multiplayer</span> Trivia
        </h1>
        <p className="text-muted-foreground text-lg">Challenge a friend to a live AI trivia duel!</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-border overflow-hidden mb-8">
        <button
          onClick={() => setTab('create')}
          className={cn(
            'flex-1 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2',
            tab === 'create'
              ? 'bg-violet-600 text-white'
              : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
          )}
        >
          <Plus className="w-4 h-4" /> Create Room
        </button>
        <button
          onClick={() => setTab('join')}
          className={cn(
            'flex-1 py-3 text-sm font-semibold transition-all flex items-center justify-center gap-2',
            tab === 'join'
              ? 'bg-cyan-600 text-white'
              : 'bg-secondary/40 text-muted-foreground hover:bg-secondary/60'
          )}
        >
          <LogIn className="w-4 h-4" /> Join Room
        </button>
      </div>

      {tab === 'create' && (
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-3">Choose Category</p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-8">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  'flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all',
                  category === cat.id
                    ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                    : 'border-border bg-secondary/40 text-muted-foreground hover:border-border/80 hover:bg-secondary/60'
                )}
              >
                <span className="text-xl">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
          <Button
            onClick={handleCreate}
            disabled={loading}
            size="lg"
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 h-12 text-base gap-2"
          >
            <Plus className="w-5 h-5" />
            {loading ? 'Creating...' : 'Create Room'}
          </Button>
        </div>
      )}

      {tab === 'join' && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-muted-foreground mb-2">Enter Room Code</p>
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              className="text-center text-2xl font-mono tracking-[0.4em] h-14 uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            />
          </div>
          <Button
            onClick={handleJoin}
            disabled={loading || joinCode.trim().length < 4}
            size="lg"
            className="w-full bg-gradient-to-r from-cyan-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white border-0 h-12 text-base gap-2"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Joining...' : 'Join Room'}
          </Button>
        </div>
      )}

      {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}

      <div className="mt-8 text-center">
        <Link href="/game" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Solo Game
        </Link>
      </div>
    </div>
  )
}
