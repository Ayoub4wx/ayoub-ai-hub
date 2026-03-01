import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Parser from 'rss-parser'

export const dynamic = 'force-dynamic'

const BOT_EMAIL = 'ai.blogger@aihub.internal'
const BOT_USERNAME = 'ai_blogger'
const BOT_DISPLAY_NAME = 'AI Blogger'
const BOT_BIO = 'Automated AI news analysis. Powered by free LLMs via OpenRouter. Posts daily insights from across the AI web.'
const BOT_AVATAR = 'https://api.dicebear.com/7.x/bottts/svg?seed=ai-blogger&backgroundColor=6d28d9'

const RSS_FEEDS = [
  { url: 'https://techcrunch.com/category/artificial-intelligence/feed/', name: 'TechCrunch AI' },
  { url: 'https://www.wired.com/feed/tag/ai/latest/rss', name: 'Wired AI' },
  { url: 'https://rss.arxiv.org/rss/cs.AI', name: 'Arxiv AI' },
]

const FREE_MODELS = [
  'google/gemma-3-4b-it:free',
  'nvidia/nemotron-nano-9b-v2:free',
  'arcee-ai/trinity-mini:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
  'meta-llama/llama-3.3-70b-instruct:free',
]

async function getOrCreateBotId(supabase: ReturnType<typeof createClient>): Promise<string> {
  // Check if bot profile already exists by username
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', BOT_USERNAME)
    .single()

  if (existing) return existing.id as string

  // Create a real Supabase Auth user for the bot (needed for FK constraint on profiles)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: BOT_EMAIL,
    password: crypto.randomUUID(),
    email_confirm: true,
  })

  if (authError || !authData?.user) {
    throw new Error(`Bot auth user creation failed: ${authError?.message}`)
  }

  const botId = authData.user.id

  // Brief pause for trigger to fire
  await new Promise((r) => setTimeout(r, 600))

  // Upsert profile with correct bot details
  await supabase.from('profiles').upsert({
    id: botId,
    username: BOT_USERNAME,
    display_name: BOT_DISPLAY_NAME,
    bio: BOT_BIO,
    avatar_url: BOT_AVATAR,
  })

  return botId
}

async function fetchArticles() {
  const parser = new Parser({ timeout: 10000 })
  const articles: { title: string; description: string; source: string }[] = []

  await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, name }) => {
      const feed = await parser.parseURL(url)
      feed.items.slice(0, 4).forEach((item) => {
        if (item.title) {
          articles.push({
            title: item.title,
            description: (item.contentSnippet || item.summary || '').slice(0, 250),
            source: name,
          })
        }
      })
    })
  )

  return articles.slice(0, 9)
}

async function generateBlogPost(articles: { title: string; description: string; source: string }[]) {
  const articlesText = articles
    .map((a, i) => `${i + 1}. [${a.source}] "${a.title}"\n   ${a.description}`)
    .join('\n\n')

  const prompt = `You are an AI news blogger writing for an AI & tech enthusiast community. Analyze these recent AI news headlines and write a compelling original blog post.

Recent AI News Headlines:
${articlesText}

Write an insightful blog post about the most significant AI development(s) from today. Requirements:
- Original, specific title (avoid generic phrases like "Today in AI")
- 350-500 words total
- Analysis and commentary — not just a summary of the articles
- Your perspective on what this means for the field
- Written for AI enthusiasts who want depth and insight
- End with ONE open question inviting community discussion
- Use markdown: **bold** for key terms, ## for one or two section headers

IMPORTANT: Respond with ONLY valid JSON (no extra text):
{"title":"string","content":"string with markdown","tags":["tag1","tag2","tag3","tag4"]}`

  for (const model of FREE_MODELS) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.OPENROUTER_SITE_URL || 'https://localhost',
          'X-Title': process.env.OPENROUTER_SITE_NAME || 'Ayoub AI Hub',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.75,
          max_tokens: 1200,
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) continue

      const data = await res.json()
      const text: string = data.choices?.[0]?.message?.content || ''

      // Extract JSON block from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) continue

      const parsed = JSON.parse(jsonMatch[0])
      if (parsed.title && parsed.content && Array.isArray(parsed.tags)) {
        return {
          title: parsed.title as string,
          content: parsed.content as string,
          tags: (parsed.tags as string[]).map((t) => t.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30)).filter(Boolean),
        }
      }
    } catch {
      continue
    }
  }

  return null
}

export async function GET(request: Request) {
  // Verify Vercel cron secret
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const botId = await getOrCreateBotId(supabase)

    const articles = await fetchArticles()
    if (articles.length === 0) {
      return NextResponse.json({ error: 'No articles fetched from RSS feeds' }, { status: 500 })
    }

    const post = await generateBlogPost(articles)
    if (!post) {
      return NextResponse.json({ error: 'AI generation failed — all models returned unusable output' }, { status: 500 })
    }

    const { data: inserted, error: insertError } = await supabase
      .from('posts')
      .insert({
        author_id: botId,
        title: post.title.slice(0, 200),
        content: post.content,
        tags: post.tags.slice(0, 5),
      })
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      postId: inserted.id,
      title: post.title,
      tags: post.tags,
    })
  } catch (err) {
    console.error('AI Blogger cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
