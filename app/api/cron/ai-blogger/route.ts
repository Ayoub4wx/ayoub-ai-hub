import { NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
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
const DEFAULT_GROQ_MODEL = 'llama-3.3-70b-versatile'

const DEFAULT_X_QUERY = '(AI OR "artificial intelligence" OR LLM OR OpenAI OR Anthropic OR Gemini OR xAI) lang:en -is:retweet -is:reply'

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

function sanitizeTag(tag: string) {
  return tag.replace(/[^a-zA-Z0-9]/g, '').slice(0, 30)
}

function trimText(value: string, max: number) {
  return value.replace(/\s+/g, ' ').trim().slice(0, max)
}

function absoluteUrl(url: string, base?: string) {
  try {
    return new URL(url, base).toString()
  } catch {
    return url
  }
}

type ArticleCandidate = {
  title: string
  description: string
  source: string
  link?: string
  imageUrl?: string
  canonicalUrl?: string
  siteName?: string
  publishedAt?: string
}

type XSearchResponse = {
  data?: Array<{
    id: string
    text: string
    created_at?: string
    author_id?: string
    attachments?: { media_keys?: string[] }
  }>
  includes?: {
    users?: Array<{ id: string; username: string; name?: string }>
    media?: Array<{ media_key: string; type?: string; url?: string; preview_image_url?: string }>
  }
}

type GeneratedPost = {
  title: string
  slug: string
  excerpt: string
  metaDescription: string
  coverImageAlt: string
  coverImageUrl: string | null
  featuredSourceIndex: number
  sourceUrl: string | null
  sourceTitle: string | null
  sourceSiteName: string | null
  sourceImageUrl: string | null
  sourcePublishedAt: string | null
  content: string
  tags: string[]
}

async function resolveArticleImage(article: ArticleCandidate) {
  if (article.imageUrl) return article.imageUrl
  const metadata = await fetchArticleMetadata(article.link)
  return metadata?.imageUrl
}

function extractMetaContent(html: string, attr: 'property' | 'name', key: string) {
  return (
    html.match(new RegExp(`<meta[^>]+${attr}=["']${key}["'][^>]+content=["']([^"']+)["']`, 'i'))?.[1] ||
    html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+${attr}=["']${key}["']`, 'i'))?.[1]
  )
}

async function fetchArticleMetadata(link?: string) {
  if (!link) return null

  try {
    const res = await fetch(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AyoubAIHubBot/1.0)',
      },
      signal: AbortSignal.timeout(12000),
      cache: 'no-store',
    })

    if (!res.ok) return null

    const html = await res.text()
    const title =
      extractMetaContent(html, 'property', 'og:title') ||
      html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]
    const description =
      extractMetaContent(html, 'property', 'og:description') ||
      extractMetaContent(html, 'name', 'description')
    const imageUrl =
      extractMetaContent(html, 'property', 'og:image') ||
      extractMetaContent(html, 'name', 'twitter:image') ||
      html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
    const canonicalUrl =
      html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i)?.[1] ||
      extractMetaContent(html, 'property', 'og:url') ||
      link
    const siteName =
      extractMetaContent(html, 'property', 'og:site_name') ||
      new URL(link).hostname.replace(/^www\./, '')
    const publishedAt =
      extractMetaContent(html, 'property', 'article:published_time') ||
      html.match(/<time[^>]+datetime=["']([^"']+)["']/i)?.[1]

    return {
      title: title ? trimText(title, 200) : undefined,
      description: description ? trimText(description, 300) : undefined,
      imageUrl: imageUrl ? absoluteUrl(imageUrl, link) : undefined,
      canonicalUrl: canonicalUrl ? absoluteUrl(canonicalUrl, link) : link,
      siteName: siteName ? trimText(siteName, 80) : undefined,
      publishedAt: publishedAt || undefined,
    }
  } catch {
    return null
  }
}

async function fetchXArticles(topic?: string): Promise<ArticleCandidate[]> {
  const bearerToken = process.env.X_BEARER_TOKEN || process.env.TWITTER_BEARER_TOKEN
  if (!bearerToken) return []

  const query = topic
    ? `(${topic} OR #${topic.replace(/\s+/g, '')} OR AI OR "artificial intelligence") lang:en -is:retweet -is:reply`
    : DEFAULT_X_QUERY

  try {
    const params = new URLSearchParams({
      query,
      max_results: '10',
      expansions: 'author_id,attachments.media_keys',
      'tweet.fields': 'created_at,author_id,attachments',
      'user.fields': 'username,name',
      'media.fields': 'url,preview_image_url,type',
    })

    const res = await fetch(`https://api.x.com/2/tweets/search/recent?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    })

    if (!res.ok) return []

    const payload: XSearchResponse = await res.json()
    const users = new Map((payload.includes?.users || []).map((user) => [user.id, user]))
    const media = new Map((payload.includes?.media || []).map((item) => [item.media_key, item]))

    return (payload.data || []).map((post) => {
      const author = post.author_id ? users.get(post.author_id) : undefined
      const mediaItem = post.attachments?.media_keys?.map((key) => media.get(key)).find(Boolean)
      const username = author?.username || 'i'
      const sourceUrl = `https://x.com/${username}/status/${post.id}`
      const cleanText = trimText(post.text.replace(/\s+/g, ' '), 280)

      return {
        title: cleanText.length > 110 ? `${cleanText.slice(0, 107)}...` : cleanText,
        description: cleanText,
        source: 'X',
        link: sourceUrl,
        canonicalUrl: sourceUrl,
        siteName: 'X',
        imageUrl: mediaItem?.url || mediaItem?.preview_image_url,
        publishedAt: post.created_at,
      }
    })
  } catch {
    return []
  }
}

function scoreArticleForTopic(article: ArticleCandidate, topic?: string) {
  if (!topic) return 0
  const haystack = `${article.title} ${article.description} ${article.source}`.toLowerCase()
  const needle = topic.toLowerCase()
  return haystack.includes(needle) ? 1 : 0
}

function buildFallbackBlogPost(articles: ArticleCandidate[], topic?: string): GeneratedPost | null {
  const featuredArticle = articles[0]
  if (!featuredArticle) return null

  const relatedArticles = articles.slice(1, 4)
  const topicLabel = topic || featuredArticle.siteName || 'AI'
  const title = topic
    ? `${topic} in the Latest AI News: What This Week's Coverage Signals`
    : `${featuredArticle.source}: What the Latest AI Coverage Signals`

  const relatedBullets = relatedArticles.length > 0
    ? relatedArticles.map((article) => `- **${article.title}**: ${trimText(article.description || 'Additional context from recent coverage.', 180)}`).join('\n')
    : '- Broader AI coverage remains fast-moving, with companies balancing product momentum, public trust, and competitive pressure.'

  const content = `## Why This Story Matters

**${featuredArticle.title}** is the clearest signal in the current news cycle around **${topicLabel}**. The source coverage points to a shift that matters beyond a single announcement: it reflects how leading AI companies are positioning themselves on product strategy, competition, and public trust.

Rather than treating this as an isolated headline, it makes more sense to read it as part of a broader market pattern. AI companies are increasingly judged on three things at the same time:

- How quickly they can ship useful products
- How clearly they communicate risk and governance
- How well they translate technical progress into durable business advantage

## What The Source Article Suggests

The original report from **${featuredArticle.siteName || featuredArticle.source}** frames the story around **${featuredArticle.title}**. Even from the available metadata and summary, the key implication is clear: **${topicLabel}** remains central to the next phase of the AI platform race.

${trimText(featuredArticle.description || 'The article points to strategic movement that could shape how the market evaluates product quality, deployment strategy, and long-term credibility.', 280)}

That matters for SEO-focused publishing too. Readers are not just looking for a recap of events; they want interpretation. The real question is what this development changes for builders, operators, investors, and everyday users watching the AI market evolve.

## The Broader Industry Context

This source article sits inside a wider set of headlines that reinforce the same theme: the AI market is no longer being judged purely on novelty. Execution, reliability, and positioning now matter more than hype.

${relatedBullets}

Taken together, these signals suggest a more mature phase of the market. Companies like **${topicLabel}** are being evaluated not only on model quality, but also on ecosystem strength, message discipline, distribution, and whether they can sustain trust while moving quickly.

## What To Watch Next

There are a few practical questions worth tracking after this story:

- Will this development lead to a visible product, partnership, or platform shift?
- Does it change how developers or enterprise teams evaluate the company?
- Will competitors respond with new launches, pricing moves, or distribution partnerships?
- Does the public narrative improve confidence, or raise new concerns?

Those questions are what turn a headline into a trend. They also determine whether this moment becomes a short-lived news spike or part of a larger strategic transition.

## Final Take

The strongest takeaway from **${featuredArticle.title}** is not just the announcement itself. It is what the coverage reveals about the direction of the AI market: focus is moving toward durable advantage, trust, and execution quality.

For anyone following **${topicLabel}**, this is the more useful lens. Headlines come and go, but the companies that define the next cycle will be the ones that turn attention into products, products into adoption, and adoption into long-term credibility.

Open question: if this story is an early signal of ${topicLabel}'s next move, what should the market watch most closely over the next 90 days?`

  const inferredTags = [topic, featuredArticle.siteName, featuredArticle.source, 'AI', 'TechNews']
    .filter(Boolean)
    .map((tag) => sanitizeTag(String(tag)))
    .filter(Boolean)

  return {
    title,
    slug: slugify(title),
    excerpt: trimText(featuredArticle.description || `${topicLabel} remains a major force in the latest AI news cycle, with new coverage signaling broader shifts in strategy and competition.`, 180),
    metaDescription: trimText(featuredArticle.description || `${topicLabel} remains a major force in the latest AI news cycle.`, 160),
    coverImageAlt: trimText(featuredArticle.title || title, 140),
    coverImageUrl: featuredArticle.imageUrl || null,
    featuredSourceIndex: 1,
    sourceUrl: featuredArticle.canonicalUrl || featuredArticle.link || null,
    sourceTitle: featuredArticle.title || null,
    sourceSiteName: featuredArticle.siteName || featuredArticle.source || null,
    sourceImageUrl: featuredArticle.imageUrl || null,
    sourcePublishedAt: featuredArticle.publishedAt || null,
    content,
    tags: inferredTags.slice(0, 5),
  }
}

async function parseGeneratedPost(text: string, articles: ArticleCandidate[]) {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return null

  const parsed = JSON.parse(jsonMatch[0])
  if (!(parsed.title && parsed.content && Array.isArray(parsed.tags))) {
    return null
  }

  const requestedIndex = Number(parsed.featuredSourceIndex)
  const normalizedIndex = Number.isFinite(requestedIndex) && requestedIndex >= 1 && requestedIndex <= articles.length
    ? requestedIndex - 1
    : 0
  const featuredArticle = articles[normalizedIndex] || articles[0]
  const coverImageUrl = featuredArticle ? await resolveArticleImage(featuredArticle) : null

  return {
    title: String(parsed.title),
    slug: slugify(String(parsed.title)),
    excerpt: trimText(String(parsed.excerpt || parsed.metaDescription || parsed.title), 180),
    metaDescription: trimText(String(parsed.metaDescription || parsed.excerpt || parsed.title), 160),
    coverImageAlt: trimText(String(parsed.coverImageAlt || featuredArticle?.title || parsed.title), 140),
    coverImageUrl,
    featuredSourceIndex: normalizedIndex + 1,
    sourceUrl: featuredArticle?.canonicalUrl || featuredArticle?.link || null,
    sourceTitle: featuredArticle?.title || null,
    sourceSiteName: featuredArticle?.siteName || featuredArticle?.source || null,
    sourceImageUrl: coverImageUrl,
    sourcePublishedAt: featuredArticle?.publishedAt || null,
    content: String(parsed.content),
    tags: Array.from(new Set((parsed.tags as string[]).map(sanitizeTag).filter(Boolean))).slice(0, 5),
  } satisfies GeneratedPost
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getOrCreateBotId(supabase: SupabaseClient<any>): Promise<string> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', BOT_USERNAME)
    .single()

  if (existing) return (existing as { id: string }).id

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: BOT_EMAIL,
    password: crypto.randomUUID(),
    email_confirm: true,
  })

  if (authError || !authData?.user) {
    throw new Error(`Bot auth user creation failed: ${authError?.message}`)
  }

  const botId = authData.user.id

  await new Promise((r) => setTimeout(r, 600))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const profileRow: any = { id: botId, username: BOT_USERNAME, display_name: BOT_DISPLAY_NAME, bio: BOT_BIO, avatar_url: BOT_AVATAR }
  await supabase.from('profiles').upsert(profileRow)

  return botId
}

async function fetchArticles(topic?: string) {
  const parser = new Parser({ timeout: 10000 })
  const articles: ArticleCandidate[] = []
  const xArticles = await fetchXArticles(topic)
  articles.push(...xArticles)

  await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, name }) => {
      const feed = await parser.parseURL(url)
      for (const item of feed.items.slice(0, 4)) {
        if (!item.title) return

        const rawItem = item as Parser.Item & {
          enclosure?: { url?: string }
          'media:content'?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>
          'media:thumbnail'?: { $?: { url?: string } } | Array<{ $?: { url?: string } }>
          content?: string
        }
        const mediaContent = Array.isArray(rawItem['media:content']) ? rawItem['media:content'][0] : rawItem['media:content']
        const mediaThumbnail = Array.isArray(rawItem['media:thumbnail']) ? rawItem['media:thumbnail'][0] : rawItem['media:thumbnail']
        const imageFromContent = rawItem.content?.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1]
        const pageMetadata = item.link ? await fetchArticleMetadata(item.link) : null
        const imageUrl =
          mediaContent?.$?.url ||
          mediaThumbnail?.$?.url ||
          rawItem.enclosure?.url ||
          imageFromContent ||
          pageMetadata?.imageUrl

        articles.push({
          title: pageMetadata?.title || item.title,
          description: pageMetadata?.description || (item.contentSnippet || item.summary || '').slice(0, 250),
          source: pageMetadata?.siteName || name,
          link: pageMetadata?.canonicalUrl || item.link,
          imageUrl,
          canonicalUrl: pageMetadata?.canonicalUrl || item.link,
          siteName: pageMetadata?.siteName || name,
          publishedAt: pageMetadata?.publishedAt || item.pubDate || item.isoDate,
        })
      }
    })
  )

  return articles
    .sort((a, b) => scoreArticleForTopic(b, topic) - scoreArticleForTopic(a, topic))
    .slice(0, 9)
}

async function generateBlogPost(articles: ArticleCandidate[], topic?: string): Promise<GeneratedPost | null> {
  const articlesText = articles
    .map((a, i) => `${i + 1}. [${a.source}] "${a.title}"\n   ${a.description}\n   Link: ${a.link || 'N/A'}\n   Image: ${a.imageUrl || 'N/A'}`)
    .join('\n\n')

  const topicInstruction = topic
    ? `Focus the article on ${topic}. Prioritize any headlines directly related to ${topic}. If there are only partial matches, connect the coverage back to ${topic} without inventing unsupported facts.`
    : 'Focus on the most significant AI development(s) from today.'

  const prompt = `You are an AI news blogger writing a full SEO-oriented article page for an AI & tech enthusiast community. Analyze these recent AI news headlines and write a compelling original long-form blog post.

Recent AI News Headlines:
${articlesText}

Write an insightful blog post. ${topicInstruction} Requirements:
- Original, specific title with a clear primary keyword
- 900-1400 words total
- Analysis and commentary, not just a summary of the articles
- Strong introduction, 3-5 substantial ## sections, and a short conclusion
- Include practical implications, competitive context, and what to watch next
- Written for AI enthusiasts who want depth and insight
- End with ONE open question inviting community discussion
- Use markdown: **bold** for key terms, multiple ## section headers, and bullet lists when useful
- Do not invent facts that are not supported by the headlines and summaries

IMPORTANT: Respond with ONLY valid JSON (no extra text):
{"title":"string","excerpt":"string under 180 chars","metaDescription":"string under 160 chars","coverImageAlt":"string","featuredSourceIndex":1,"content":"string with markdown","tags":["tag1","tag2","tag3","tag4"]}`

  if (process.env.GROQ_API_KEY) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_completion_tokens: 2200,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (groqRes.ok) {
        const data = await groqRes.json()
        const text: string = data.choices?.[0]?.message?.content || ''
        const parsed = await parseGeneratedPost(text, articles)
        if (parsed) return parsed
      }
    } catch {
      // Fall through to OpenRouter
    }
  }

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
          max_tokens: 2200,
        }),
        signal: AbortSignal.timeout(30000),
      })

      if (!res.ok) continue

      const data = await res.json()
      const text: string = data.choices?.[0]?.message?.content || ''
      const parsed = await parseGeneratedPost(text, articles)
      if (parsed) return parsed
    } catch {
      continue
    }
  }

  return null
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { searchParams } = new URL(request.url)
  const topic = searchParams.get('topic')?.trim() || undefined

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: 'Missing Supabase config' }, { status: 500 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  try {
    const botId = await getOrCreateBotId(supabase)

    const articles = await fetchArticles(topic)
    if (articles.length === 0) {
      return NextResponse.json({ error: 'No articles fetched from RSS feeds' }, { status: 500 })
    }

    const post = await generateBlogPost(articles, topic) || buildFallbackBlogPost(articles, topic)
    if (!post) {
      return NextResponse.json({ error: 'AI generation failed - all models returned unusable output' }, { status: 500 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const postRow: any = {
      author_id: botId,
      title: post.title.slice(0, 200),
      slug: `${post.slug || slugify(post.title)}-${Date.now().toString().slice(-6)}`,
      excerpt: post.excerpt,
      meta_description: post.metaDescription,
      cover_image_url: post.coverImageUrl,
      cover_image_alt: post.coverImageAlt,
      source_url: post.sourceUrl,
      source_title: post.sourceTitle,
      source_site_name: post.sourceSiteName,
      source_image_url: post.sourceImageUrl,
      source_published_at: post.sourcePublishedAt,
      content: post.content,
      tags: post.tags.slice(0, 5),
    }
    const { data: inserted, error: insertError } = await supabase
      .from('posts')
      .insert(postRow)
      .select('id')
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      postId: (inserted as { id: string } | null)?.id,
      title: post.title,
      tags: post.tags,
      topic,
      featuredSourceIndex: post.featuredSourceIndex,
      slug: postRow.slug,
      coverImageUrl: post.coverImageUrl,
      sourceUrl: post.sourceUrl,
      sourceTitle: post.sourceTitle,
    })
  } catch (err) {
    console.error('AI Blogger cron error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
