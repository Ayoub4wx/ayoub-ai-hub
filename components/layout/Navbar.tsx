'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Menu, Moon, Sun, Bot, User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NAV_LINKS } from '@/constants/nav-links'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface Profile {
  username: string
  display_name: string | null
  avatar_url: string | null
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)

    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) fetchProfile()
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile()
      else setProfile(null)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile')
      if (res.ok) setProfile(await res.json())
    } catch { /* silently fail */ }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    router.push('/')
    router.refresh()
  }

  const avatarSrc = profile?.avatar_url ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${profile?.display_name || profile?.username || 'U'}`

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border shadow-lg'
          : 'bg-transparent'
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text hidden sm:block">Ayoub AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  pathname === link.href
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="rounded-lg"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            )}

            {/* User avatar dropdown (logged in) or Ask AI (logged out) */}
            {mounted && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/40 hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50">
                    <Image
                      src={avatarSrc}
                      alt={profile?.display_name || 'Profile'}
                      width={32}
                      height={32}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium truncate">{profile?.display_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">@{profile?.username}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-border" />
                  {profile && (
                    <DropdownMenuItem asChild>
                      <Link href={`/profile/${profile.username}`} className="flex items-center gap-2 cursor-pointer">
                        <User className="w-4 h-4" />
                        My Profile
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile/edit" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="flex items-center gap-2 cursor-pointer text-red-500 focus:text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/ask-ai" className="hidden sm:block">
                <Button size="sm" className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white border-0 gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  Ask AI
                </Button>
              </Link>
            )}

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-background border-border">
                <div className="flex flex-col gap-1 mt-8">
                  <div className="flex items-center gap-2 mb-6 px-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg gradient-text">Ayoub AI Hub</span>
                  </div>

                  {user && profile && (
                    <div className="flex items-center gap-3 px-2 py-3 mb-2 border border-border rounded-lg bg-secondary/30">
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-border flex-shrink-0">
                        <Image src={avatarSrc} alt="avatar" width={36} height={36} className="object-cover" unoptimized />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{profile.display_name || profile.username}</p>
                        <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                      </div>
                    </div>
                  )}

                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'px-4 py-3 rounded-lg text-sm font-medium transition-all',
                        pathname === link.href
                          ? 'bg-primary/20 text-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="mt-4 px-2 space-y-2">
                    {user ? (
                      <>
                        {profile && (
                          <Link href={`/profile/${profile.username}`} onClick={() => setMobileOpen(false)}>
                            <Button variant="outline" className="w-full gap-2 border-border">
                              <User className="w-4 h-4" />
                              My Profile
                            </Button>
                          </Link>
                        )}
                        <Link href="/profile/edit" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full gap-2 border-border">
                            <Settings className="w-4 h-4" />
                            Edit Profile
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="w-full gap-2 border-red-500/30 text-red-500 hover:bg-red-500/10"
                          onClick={() => { setMobileOpen(false); handleSignOut() }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/ask-ai" onClick={() => setMobileOpen(false)}>
                          <Button className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0 gap-2">
                            <Bot className="w-4 h-4" />
                            Ask AI
                          </Button>
                        </Link>
                        <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                          <Button variant="outline" className="w-full border-border gap-2">
                            Sign In
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </header>
  )
}
