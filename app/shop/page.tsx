'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { ShoppingBag, Coins, Check, Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ShopItem {
  id: string
  name: string
  description: string
  icon: string
  category: 'profile_frame' | 'name_color' | 'badge' | 'chat_theme'
  cost_points: number
  css_value: string
  owned: boolean
  equipped: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Items',
  profile_frame: 'Profile Frames',
  name_color: 'Name Colors',
  badge: 'Profile Badges',
  chat_theme: 'Chat Themes',
}

export default function ShopPage() {
  const [items, setItems] = useState<ShopItem[]>([])
  const [userPoints, setUserPoints] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetch('/api/shop')
      .then((r) => r.json())
      .then((data) => {
        setItems(data.items || [])
        setUserPoints(data.user_points || 0)
        setIsLoggedIn(data.is_logged_in || false)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleAction = async (item: ShopItem, action: 'buy' | 'equip') => {
    if (!isLoggedIn) {
      toast({ title: 'Sign in required', description: 'Please sign in to use the shop', variant: 'destructive' })
      return
    }
    setActionLoading(item.id + action)
    const res = await fetch('/api/shop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, item_id: item.id }),
    })
    const data = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: data.error, variant: 'destructive' })
    } else {
      if (action === 'buy') {
        setUserPoints(data.new_points)
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, owned: true } : i))
        )
        toast({ title: `${item.icon} Purchased!`, description: `${item.name} is now yours.` })
      } else {
        setItems((prev) =>
          prev.map((i) =>
            i.category === item.category
              ? { ...i, equipped: i.id === item.id }
              : i
          )
        )
        toast({ title: `${item.icon} Equipped!`, description: `${item.name} is now active on your profile.` })
      }
    }
    setActionLoading(null)
  }

  const filtered = activeTab === 'all' ? items : items.filter((i) => i.category === activeTab)

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <Badge className="mb-2 bg-yellow-400/20 text-yellow-300 border-yellow-400/30">Points Economy</Badge>
          <h1 className="text-4xl font-bold">
            AI Hub <span className="gradient-text">Shop</span>
          </h1>
          <p className="text-muted-foreground mt-1">Spend your earned points on profile cosmetics</p>
        </div>
        {isLoggedIn && (
          <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-5 py-3">
            <Coins className="w-5 h-5 text-yellow-400" />
            <div>
              <p className="text-xl font-bold text-yellow-300">{userPoints.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">your points</p>
            </div>
          </div>
        )}
      </div>

      {/* How to earn */}
      <div className="mb-8 bg-secondary/30 border border-border rounded-xl p-5">
        <p className="text-sm font-semibold mb-2">How to earn points</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-muted-foreground">
          <span>🎮 Daily trivia: +25–95</span>
          <span>🔥 Streak bonuses: +10/day</span>
          <span>✍️ Post in community: +5</span>
          <span>❤️ Get a like: +2</span>
          <span>💬 Leave a comment: +1</span>
          <span>⚔️ Multiplayer win: +50</span>
          <span>🔑 First API key: badge</span>
          <span>🏆 Perfect score: badge</span>
        </div>
        <Link href="/game" className="inline-flex items-center gap-1.5 text-xs text-violet-400 hover:underline mt-3">
          <Gamepad2 className="w-3 h-3" />
          Play trivia to earn points fast
        </Link>
      </div>

      {!isLoggedIn && (
        <div className="mb-8 text-center py-8 border border-border rounded-xl">
          <ShoppingBag className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-3">Sign in to purchase and equip items</p>
          <Link href="/auth/login">
            <Button className="bg-violet-600 hover:bg-violet-500">Sign In</Button>
          </Link>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all border',
              activeTab === key
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'border-border text-muted-foreground hover:border-border/80 hover:text-foreground'
            )}
          >
            {label}
            <span className="ml-1.5 text-xs opacity-60">
              ({(activeTab === key ? items : items.filter((i) => key === 'all' || i.category === key)).length})
            </span>
          </button>
        ))}
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-secondary/30 border border-border rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={cn(
                'relative flex flex-col border rounded-xl p-4 transition-all bg-secondary/30',
                item.equipped
                  ? 'border-violet-500/60 bg-violet-500/10'
                  : item.owned
                  ? 'border-green-500/30 bg-green-500/5'
                  : 'border-border hover:border-border/80'
              )}
            >
              {item.equipped && (
                <span className="absolute top-2 right-2 text-xs bg-violet-500/30 text-violet-300 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-2.5 h-2.5" /> On
                </span>
              )}

              <div className="text-3xl mb-2">{item.icon}</div>
              <p className="font-semibold text-sm mb-1">{item.name}</p>
              <p className="text-xs text-muted-foreground mb-3 flex-1">{item.description}</p>

              <div className="flex items-center justify-between mt-auto">
                <span className="text-xs font-bold text-yellow-400">
                  {item.owned ? '✓ owned' : `${item.cost_points} pts`}
                </span>
              </div>

              {isLoggedIn && (
                <div className="mt-3">
                  {!item.owned ? (
                    <Button
                      size="sm"
                      onClick={() => handleAction(item, 'buy')}
                      disabled={actionLoading === item.id + 'buy' || userPoints < item.cost_points}
                      className={cn(
                        'w-full h-7 text-xs',
                        userPoints >= item.cost_points
                          ? 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30'
                          : 'opacity-40 cursor-not-allowed bg-secondary'
                      )}
                    >
                      {actionLoading === item.id + 'buy' ? '...' : `Buy ${item.cost_points}pts`}
                    </Button>
                  ) : item.equipped ? (
                    <div className="w-full h-7 text-xs flex items-center justify-center text-violet-400 font-medium">
                      Equipped ✓
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleAction(item, 'equip')}
                      disabled={actionLoading === item.id + 'equip'}
                      className="w-full h-7 text-xs bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 border border-violet-500/30"
                    >
                      {actionLoading === item.id + 'equip' ? '...' : 'Equip'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
