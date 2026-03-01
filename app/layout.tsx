import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import ChatWidget from '@/components/chat/ChatWidget'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Ayoub AI Hub — AI & Tech News, Community & Updates',
    template: '%s | Ayoub AI Hub',
  },
  description:
    'Your hub for AI & tech news, community discussions, and cutting-edge content by Ayoub. Stay updated with the latest in artificial intelligence.',
  keywords: ['AI', 'artificial intelligence', 'tech news', 'machine learning', 'Ayoub', 'AI community', 'LLM', 'ChatGPT'],
  authors: [{ name: 'Ayoub' }],
  creator: 'Ayoub',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Ayoub AI Hub',
    title: 'Ayoub AI Hub — AI & Tech News, Community & Updates',
    description: 'Your hub for AI & tech news, community discussions, and cutting-edge content.',
    images: [{ url: '/pfp.jpg', width: 1080, height: 1080, alt: 'Ayoub' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ayoub AI Hub',
    description: 'Your hub for AI & tech news, community discussions, and cutting-edge content.',
    images: ['/pfp.jpg'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased min-h-screen`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 pt-16">{children}</main>
            <Footer />
          </div>
          <ChatWidget />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
