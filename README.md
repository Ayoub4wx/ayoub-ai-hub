# Ayoub AI Hub

A personal portfolio and AI news hub for tech/AI influencer Ayoub. Features a live AI news aggregator, streaming AI chatbot, community platform, and AI trivia game.

## Features

- **Homepage** — Hero section, social feed (YouTube/TikTok/Instagram), AI news highlights, CTAs
- **AI News** — Live RSS feed from Arxiv, TechCrunch AI, Wired AI, MIT Tech Review with search/filter/sort
- **AI Chatbot** — Streaming chat powered by free LLMs via OpenRouter with site-wide floating widget
- **Community** — Post, comment, like, and discuss AI topics (auth required to post)
- **AI Trivia Game** — 50 AI/ML trivia questions with timer, streak bonuses, and high score tracking
- **Static Pages** — About, Projects, Contact, Terms, Privacy
- **Dark Mode** — Default dark theme with toggle

## Tech Stack

- **Next.js 14** (App Router, TypeScript)
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** — Auth + PostgreSQL database + Realtime
- **OpenRouter** — Free AI models (DeepSeek, Qwen)
- **rss-parser** — RSS feed aggregation
- **Vercel** — Hosting (free tier)

## Setup Instructions

### 1. Install Dependencies

```bash
cd ayoub-portfolio
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

**Required variables:**

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `OPENROUTER_API_KEY` | https://openrouter.ai/keys |

**Optional variables:**

| Variable | Purpose |
|---|---|
| `YOUTUBE_API_KEY` | YouTube Data API v3 (Google Cloud Console) |
| `YOUTUBE_CHANNEL_ID` | Your YouTube channel ID |
| `MAILERLITE_API_KEY` | Newsletter subscriptions |
| `RESEND_API_KEY` | Contact form emails |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics 4 |

### 3. Set Up Supabase Database

1. Create a free project at https://supabase.com
2. Go to **SQL Editor** in your Supabase dashboard
3. Copy and run the entire contents of `supabase-schema.sql`
4. Go to **Authentication → URL Configuration** and set:
   - Site URL: `http://localhost:3000` (dev) or your domain
   - Redirect URLs: `http://localhost:3000/auth/callback`

### 4. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 5. Deploy to Vercel

1. Push this folder to GitHub
2. Connect repo to https://vercel.com
3. Add all environment variables in Vercel dashboard
4. Update `NEXT_PUBLIC_APP_URL` and `OPENROUTER_SITE_URL` to your production domain
5. Deploy!

---

## Updating Social Content

**TikTok & Instagram** — Update the curated lists in:
`components/home/SocialFeed.tsx` → `TIKTOK_VIDEOS` and `INSTAGRAM_POSTS` arrays

**YouTube** — Auto-fetched via YouTube Data API. Falls back to placeholder cards.

---

## Customization

| What to change | File |
|---|---|
| Trivia questions | `lib/trivia-questions.ts` |
| AI model | `lib/openrouter.ts` → `FREE_MODELS` |
| RSS sources | `constants/rss-feeds.ts` |
| Portfolio projects | `constants/projects.ts` |
| Color theme | `app/globals.css` CSS variables |
| Nav links | `constants/nav-links.ts` |
