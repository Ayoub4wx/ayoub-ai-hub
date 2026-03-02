import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { User, Calendar, FileText, Edit, Flame, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  params: { username: string }
}

export async function generateMetadata({ params }: Props) {
  return {
    title: `@${params.username} — Ayoub AI Hub`,
  }
}

const TIER_STYLES: Record<string, string> = {
  bronze: 'border-amber-600/60 bg-amber-950/40 text-amber-300',
  silver: 'border-slate-400/50 bg-slate-800/40 text-slate-300',
  gold: 'border-yellow-400/60 bg-yellow-950/40 text-yellow-300',
  diamond: 'border-cyan-400/60 bg-cyan-950/40 text-cyan-300',
}

export default async function ProfilePage({ params }: Props) {
  const supabase = createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', params.username)
    .single()

  if (!profile) notFound()

  // Fetch posts, badges in parallel
  const [postsResult, userBadgesResult] = await Promise.all([
    supabase
      .from('posts')
      .select(`
        id, title, content, tags, created_at, view_count,
        likes:likes(count),
        comments:comments(count)
      `)
      .eq('author_id', profile.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('user_badges')
      .select('badge_id, earned_at, badges(id, name, description, icon, tier)')
      .eq('user_id', profile.id)
      .order('earned_at', { ascending: false }),
  ])

  const posts = postsResult.data
  const userBadges = userBadgesResult.data || []

  // Check if viewer is the profile owner
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === profile.id

  const avatarSrc =
    profile.avatar_url ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${profile.display_name || profile.username}`

  const frameClass = profile.equipped_frame || ''
  const nameColorClass = profile.equipped_name_color || ''
  const equippedBadge = profile.equipped_badge || ''

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Profile Header */}
      <Card className="border-border bg-secondary/20 mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-5">
            {/* Avatar with equipped frame */}
            <div
              className={cn(
                'relative w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-secondary flex-shrink-0',
                frameClass
              )}
            >
              <Image
                src={avatarSrc}
                alt={profile.display_name || profile.username}
                fill
                className="object-cover"
                unoptimized
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h1 className={cn('text-2xl font-bold truncate flex items-center gap-1.5', nameColorClass)}>
                    {profile.display_name || profile.username}
                    {equippedBadge && <span className="text-base">{equippedBadge}</span>}
                  </h1>
                  <p className="text-muted-foreground text-sm">@{profile.username}</p>
                </div>
                {isOwner && (
                  <Link href="/profile/edit">
                    <Button variant="outline" size="sm" className="gap-1.5 border-border">
                      <Edit className="w-3.5 h-3.5" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </div>

              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{profile.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {formatDate(profile.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5" />
                  {posts?.length || 0} posts
                </span>
                {(profile.points ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Coins className="w-3.5 h-3.5" />
                    {(profile.points as number).toLocaleString()} points
                  </span>
                )}
                {(profile.streak_count ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-orange-400">
                    <Flame className="w-3.5 h-3.5" />
                    {profile.streak_count}-day streak
                  </span>
                )}
                {(profile.best_trivia_score ?? 0) > 0 && (
                  <span className="text-violet-400">
                    🏆 Best: {profile.best_trivia_score}/150
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      {userBadges.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Badges</h2>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {userBadges.map((ub) => {
              const badge = ub.badges as unknown as {
                id: string; name: string; description: string; icon: string; tier: string
              }
              if (!badge) return null
              return (
                <div
                  key={badge.id}
                  title={`${badge.name}: ${badge.description}`}
                  className={cn(
                    'border-2 rounded-xl p-2 text-center cursor-help transition-transform hover:scale-110',
                    TIER_STYLES[badge.tier] || TIER_STYLES.bronze
                  )}
                >
                  <div className="text-xl">{badge.icon}</div>
                  <div className="text-xs mt-0.5 truncate leading-tight">{badge.name}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Posts */}
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        Posts
      </h2>

      {!posts || posts.length === 0 ? (
        <Card className="border-border bg-secondary/20">
          <CardContent className="p-10 text-center text-muted-foreground">
            <User className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>{isOwner ? "You haven't posted anything yet." : 'No posts yet.'}</p>
            {isOwner && (
              <Link href="/community/new-post" className="mt-4 inline-block">
                <Button size="sm" className="bg-violet-600 hover:bg-violet-500 text-white border-0 mt-3">
                  Create your first post
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const likeCount = (post.likes as Array<{ count: number }>)?.[0]?.count || 0
            const commentCount = (post.comments as Array<{ count: number }>)?.[0]?.count || 0
            return (
              <Link key={post.id} href={`/community/post/${post.id}`}>
                <Card className="border-border bg-secondary/20 hover:border-primary/40 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm leading-snug mb-2 hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {post.content}
                    </p>
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {post.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs border-border px-1.5 py-0">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatDate(post.created_at)}</span>
                      <span>{likeCount} likes</span>
                      <span>{commentCount} comments</span>
                      <span>{post.view_count} views</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
