export interface NavLink {
  label: string
  href: string
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Home', href: '/' },
  { label: 'News', href: '/news' },
  { label: 'Community', href: '/community' },
  { label: 'Ask AI', href: '/ask-ai' },
  { label: 'Game', href: '/game' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Contact', href: '/contact' },
]
