'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Key, Trash2, Copy, Check, Plus, ExternalLink, Coffee } from 'lucide-react'

interface ApiKey {
  id: string
  key_prefix: string
  name: string
  plan: string
  daily_limit: number
  requests_today: number
  total_requests: number
  created_at: string
  full_key?: string
}

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    limit: '50 req/day',
    color: 'border-border',
    badge: 'bg-secondary text-foreground',
  },
  {
    name: 'Starter',
    price: '$9/mo',
    limit: '1,000 req/day',
    color: 'border-violet-500/50',
    badge: 'bg-violet-500/20 text-violet-300 border border-violet-500/30',
    kofi: true,
  },
  {
    name: 'Pro',
    price: '$29/mo',
    limit: '10,000 req/day',
    color: 'border-yellow-400/50',
    badge: 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30',
    kofi: true,
  },
]

export default function DeveloperPage() {
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true)
        fetchKeys()
      } else {
        setLoading(false)
      }
    })
  }, [])

  const fetchKeys = async () => {
    setLoading(true)
    const res = await fetch('/api/developer/keys')
    if (res.ok) {
      const data = await res.json()
      setKeys(data)
    }
    setLoading(false)
  }

  const createKey = async () => {
    if (!newKeyName.trim()) return
    setCreating(true)
    const res = await fetch('/api/developer/keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newKeyName.trim() }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: data.error, variant: 'destructive' })
    } else {
      setKeys((prev) => [data, ...prev])
      setNewKeyName('')
      toast({ title: 'API key created', description: 'Copy your key now — it will only be shown once!' })
    }
    setCreating(false)
  }

  const deleteKey = async (id: string) => {
    if (!confirm('Revoke this API key? This cannot be undone.')) return
    const res = await fetch(`/api/developer/keys?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id))
      toast({ title: 'Key revoked' })
    }
  }

  const copyKey = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast({ title: 'Copied to clipboard!' })
  }

  const planColor = (plan: string) => {
    if (plan === 'pro') return 'bg-yellow-400/20 text-yellow-300 border border-yellow-400/30'
    if (plan === 'starter') return 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
    return 'bg-secondary text-muted-foreground'
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="mb-10">
        <Badge className="mb-3 bg-cyan-500/20 text-cyan-300 border-cyan-500/30">REST API</Badge>
        <h1 className="text-4xl font-bold mb-3">
          <span className="gradient-text">Developer</span> Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Access real-time AI news data programmatically. Generate an API key and start building.
        </p>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12" id="plans">
        {PLANS.map((plan) => (
          <div key={plan.name} className={`rounded-xl border p-5 bg-secondary/30 ${plan.color}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{plan.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${plan.badge}`}>{plan.price}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{plan.limit}</p>
            {plan.kofi ? (
              <a
                href="https://ko-fi.com/ayoubai"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
              >
                <Coffee className="w-3 h-3" />
                Pay via Ko-fi → email key prefix to al4vays@gmail.com
              </a>
            ) : (
              <span className="text-xs text-muted-foreground">Default for all new keys</span>
            )}
          </div>
        ))}
      </div>

      {!isLoggedIn ? (
        <div className="text-center py-12 border border-border rounded-xl">
          <Key className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">Sign in to generate API keys</p>
          <a href="/auth/login">
            <Button className="bg-violet-600 hover:bg-violet-500">Sign In</Button>
          </a>
        </div>
      ) : (
        <>
          {/* Create Key */}
          <Card className="mb-8 border-border bg-secondary/20">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Plus className="w-4 h-4" /> Create New API Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input
                  placeholder="Key name (e.g., My Project)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && createKey()}
                  className="bg-background border-border"
                  maxLength={60}
                />
                <Button
                  onClick={createKey}
                  disabled={creating || !newKeyName.trim()}
                  className="shrink-0 bg-violet-600 hover:bg-violet-500"
                >
                  {creating ? 'Creating...' : 'Generate Key'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Your key will be shown only once. Store it securely.
              </p>
            </CardContent>
          </Card>

          {/* Keys list */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading keys...</div>
            ) : keys.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-border rounded-xl">
                No API keys yet. Create one above.
              </div>
            ) : (
              keys.map((key) => (
                <Card key={key.id} className="border-border bg-secondary/20">
                  <CardContent className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{key.name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${planColor(key.plan)}`}>
                            {key.plan}
                          </span>
                        </div>
                        <code className="text-xs text-muted-foreground font-mono">
                          {key.full_key ?? `${key.key_prefix}${'•'.repeat(40)}`}
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyKey(key.full_key ?? key.key_prefix, key.id)}
                          className="h-8 px-3"
                          title="Copy key"
                        >
                          {copiedId === key.id ? (
                            <Check className="w-3.5 h-3.5 text-green-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteKey(key.id)}
                          className="h-8 px-3 border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                          title="Revoke key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                      <span>Today: <strong className="text-foreground">{key.requests_today}</strong> / {key.daily_limit}</span>
                      <span>Total: <strong className="text-foreground">{key.total_requests}</strong></span>
                      <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                    </div>

                    {/* Usage bar */}
                    <div className="mt-3 h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
                        style={{ width: `${Math.min((key.requests_today / key.daily_limit) * 100, 100)}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Code examples */}
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-5">Usage Examples</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">cURL</p>
                <pre className="bg-secondary/50 border border-border rounded-xl p-4 text-xs font-mono overflow-x-auto text-cyan-300">
{`curl -H "Authorization: Bearer ayb_YOUR_KEY" \\
  "https://ayoub-portfolio-site.netlify.app/api/v1/news"

# Filter by source
curl -H "Authorization: Bearer ayb_YOUR_KEY" \\
  "https://ayoub-portfolio-site.netlify.app/api/v1/news?source=techcrunch,arxiv&limit=10"`}
                </pre>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">JavaScript / Node.js</p>
                <pre className="bg-secondary/50 border border-border rounded-xl p-4 text-xs font-mono overflow-x-auto text-cyan-300">
{`const response = await fetch(
  "https://ayoub-portfolio-site.netlify.app/api/v1/news?limit=20",
  { headers: { Authorization: "Bearer ayb_YOUR_KEY" } }
)
const { data, meta } = await response.json()
console.log(\`Got \${data.length} articles (\${meta.requests_used_today}/\${meta.daily_limit} req today)\`)`}
                </pre>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Python</p>
                <pre className="bg-secondary/50 border border-border rounded-xl p-4 text-xs font-mono overflow-x-auto text-cyan-300">
{`import requests

r = requests.get(
    "https://ayoub-portfolio-site.netlify.app/api/v1/news",
    headers={"Authorization": "Bearer ayb_YOUR_KEY"},
    params={"source": "arxiv", "limit": 10}
)
data = r.json()
print(f"Remaining today: {r.headers['X-RateLimit-Remaining']}")`}
                </pre>
              </div>
            </div>
          </div>

          {/* API Reference */}
          <div className="mt-10 border border-border rounded-xl p-6 bg-secondary/10">
            <h2 className="font-bold mb-4 flex items-center gap-2">
              API Reference
              <a
                href="/api/v1/news"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                Test it <ExternalLink className="w-3 h-3" />
              </a>
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <code className="text-violet-400">GET /api/v1/news</code>
                <p className="text-muted-foreground mt-1 ml-4">Returns latest AI news articles</p>
              </div>
              <div className="ml-4 space-y-1 text-xs text-muted-foreground">
                <p><code className="text-cyan-400">?source=</code> — Filter: arxiv, techcrunch, wired, mit (comma-separated)</p>
                <p><code className="text-cyan-400">?topic=</code> — Keyword filter on title and summary</p>
                <p><code className="text-cyan-400">?sort=</code> — date-desc (default), date-asc, source</p>
                <p><code className="text-cyan-400">?limit=</code> — Max results (default 50, max 100)</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
