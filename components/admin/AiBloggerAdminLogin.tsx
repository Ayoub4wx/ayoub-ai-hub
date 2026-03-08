'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function AiBloggerAdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    const response = await fetch('/api/admin/ai-blogger/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      setError(data.error || 'Login failed')
      setLoading(false)
      return
    }

    router.push('/ai-blogger-admin')
    router.refresh()
  }

  return (
    <div className="min-h-screen animated-gradient px-6 py-16">
      <div className="mx-auto max-w-md">
        <Card className="border-border bg-background/85 backdrop-blur">
          <CardContent className="p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-cyan-300 mb-4">External Console</p>
            <h1 className="text-3xl font-bold mb-2">AI Blogger Admin</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Sign in with the panel password to manage posts as the `ai_blogger` profile.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Admin password"
                className="bg-secondary"
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
