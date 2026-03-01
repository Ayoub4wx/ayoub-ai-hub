'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, User, Camera, Save } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

interface Profile {
  id: string
  username: string
  display_name: string | null
  bio: string | null
  avatar_url: string | null
}

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push('/auth/login?redirectTo=/profile/edit')
        return
      }
      fetch('/api/profile')
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            // Profile doesn't exist yet — pre-fill from auth data
            const emailPrefix = (user.email || '').split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
            setUsername(`${emailPrefix}_${user.id.substring(0, 6)}`)
            setDisplayName(user.user_metadata?.full_name || emailPrefix)
          } else {
            setProfile(data)
            setUsername(data.username || '')
            setDisplayName(data.display_name || '')
            setBio(data.bio || '')
            setAvatarUrl(data.avatar_url || '')
          }
          setLoading(false)
        })
        .catch(() => setLoading(false))
    })
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, display_name: displayName, bio, avatar_url: avatarUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save')
      setProfile(data)
      toast({ title: 'Profile saved!', description: 'Your profile has been updated.' })
      router.push(`/profile/${data.username}`)
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    )
  }

  const avatarSrc = avatarUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${displayName || username}`

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/community" className="flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 w-fit">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <h1 className="text-3xl font-bold mb-6">
        Edit <span className="gradient-text">Profile</span>
      </h1>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Avatar */}
        <Card className="border-border bg-secondary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="w-4 h-4" /> Profile Picture
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-border bg-secondary flex-shrink-0">
              {avatarSrc.startsWith('http') ? (
                <Image src={avatarSrc} alt="Avatar" fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-1.5 block">Avatar URL</label>
              <Input
                type="url"
                placeholder="https://example.com/your-photo.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste a direct image URL (JPG, PNG, WebP). Leave empty for auto-generated avatar.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="border-border bg-secondary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" /> Basic Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Username *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="your_username"
                  required
                  minLength={3}
                  maxLength={30}
                  className="bg-secondary border-border pl-7"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                3–30 characters. Letters, numbers, underscores only.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                maxLength={80}
                className="bg-secondary border-border"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Bio</label>
              <Textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell the community about yourself..."
                maxLength={300}
                rows={3}
                className="bg-secondary border-border resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{bio.length}/300</p>
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={saving || !username.trim()}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white border-0 gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Profile'}
        </Button>

        {profile && (
          <div className="text-center">
            <Link href={`/profile/${profile.username}`} className="text-sm text-muted-foreground hover:text-foreground underline">
              View public profile
            </Link>
          </div>
        )}
      </form>
    </div>
  )
}
