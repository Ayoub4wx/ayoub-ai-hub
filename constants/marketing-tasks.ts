export type TaskId = 'social' | 'youtube' | 'newsletter' | 'blog' | 'product'
export type SocialPlatform = 'Twitter/X' | 'LinkedIn' | 'TikTok'

export interface MarketingTask {
  id: TaskId
  label: string
  icon: string
  description: string
  placeholder: string
  inputLabel: string
  showPlatform?: boolean
}

export const MARKETING_TASKS: MarketingTask[] = [
  {
    id: 'social',
    label: 'Social Post',
    icon: '📱',
    description: 'Generate engaging posts for Twitter/X, LinkedIn, or TikTok',
    placeholder: 'e.g. GPT-4o just got a major update with vision capabilities...',
    inputLabel: 'Topic or AI news to post about',
    showPlatform: true,
  },
  {
    id: 'youtube',
    label: 'YouTube Description',
    icon: '▶️',
    description: 'Write SEO-optimized YouTube video descriptions with tags',
    placeholder: 'e.g. Top 5 Free AI Tools You Need in 2025',
    inputLabel: 'Video title',
  },
  {
    id: 'newsletter',
    label: 'Newsletter Email',
    icon: '📧',
    description: 'Draft a compelling MailerLite newsletter for your subscribers',
    placeholder: 'e.g. This week in AI: new open-source models, ChatGPT updates, and free tools',
    inputLabel: 'Newsletter topic or this week\'s AI highlights',
  },
  {
    id: 'blog',
    label: 'Blog Outline',
    icon: '📝',
    description: 'Create detailed SEO blog post outlines for AI topics',
    placeholder: 'e.g. How to use free AI tools to replace expensive subscriptions',
    inputLabel: 'Blog post title or topic',
  },
  {
    id: 'product',
    label: 'Product Copy',
    icon: '🚀',
    description: 'Write persuasive copy for your developer plans or Ko-fi page',
    placeholder: 'e.g. Ayoub AI Hub Developer API — Starter Plan ($9/mo)',
    inputLabel: 'Product or plan to promote',
  },
]

export function buildMarketingPrompt(
  task: TaskId,
  input: string,
  platform?: SocialPlatform
): string {
  switch (task) {
    case 'social':
      return `You are a social media expert specializing in AI and tech content for ${platform || 'Twitter/X'}.

Write a highly engaging ${platform || 'Twitter/X'} post about the following topic:
"${input}"

Requirements:
${platform === 'Twitter/X' ? '- Keep it under 280 characters (or a short thread of 2-3 tweets labeled 1/, 2/, 3/)' : ''}
${platform === 'LinkedIn' ? '- Professional tone, 150-300 words, include a hook in the first line, end with a question or CTA' : ''}
${platform === 'TikTok' ? '- Short, punchy caption under 150 characters + 5-8 relevant hashtags' : ''}
- Include relevant emojis
- Make it shareable and engaging
- Focus on the AI/tech audience
- Include relevant hashtags

Output ONLY the post content, ready to copy-paste.`

    case 'youtube':
      return `You are a YouTube SEO expert specializing in AI and tech content.

Write an optimized YouTube video description for this video title:
"${input}"

Include:
1. A hook paragraph (2-3 sentences) that describes what viewers will learn
2. Timestamps section (create 5-7 realistic chapters based on the title)
3. Links section with placeholders:
   - 🔔 Subscribe: [channel link]
   - 🌐 Website: https://ayoubaihub.com
   - 🐦 Twitter/X: [link]
   - 💼 Free AI Tools: https://ayoubaihub.com/resources
4. Relevant tags (10-15 SEO keywords) at the bottom

Keep the description between 200-400 words. Output ready to paste into YouTube Studio.`

    case 'newsletter':
      return `You are an email marketing expert writing for an AI and tech newsletter audience.

Write a complete MailerLite newsletter email about:
"${input}"

Structure:
- Subject line (compelling, under 60 chars)
- Preview text (under 90 chars)
- Greeting: "Hey [First Name]! 👋"
- Main content section (2-3 paragraphs covering key AI updates)
- "🔥 This Week's Top AI Tools" section (3 bullet points with short descriptions)
- CTA section pointing to: https://ayoubaihub.com/news
- Sign-off: "Keep building with AI, Ayoub"
- Footer note: "You're receiving this because you subscribed at ayoubaihub.com"

Tone: Friendly, enthusiastic, informative. Use emojis sparingly. Output the full email ready to paste.`

    case 'blog':
      return `You are an SEO content strategist specializing in AI and tech blog content.

Create a detailed blog post outline for:
"${input}"

Include:
1. SEO Title (under 60 chars, include primary keyword)
2. Meta Description (under 155 chars)
3. Target Keywords (5-8 keywords)
4. Introduction hook (2-3 sentences)
5. Full H2/H3 outline with:
   - 5-7 main sections (H2)
   - 2-3 subsections per H2 (H3)
   - Key points to cover in each section
6. Conclusion approach
7. Internal link suggestions (e.g. link to /resources, /ask-ai, /news)
8. Estimated word count and read time

Make it comprehensive, actionable, and optimized for ranking on Google.`

    case 'product':
      return `You are a conversion copywriter specializing in SaaS and developer tools.

Write persuasive marketing copy for:
"${input}"

Include:
1. Headline (punchy, benefit-focused, under 10 words)
2. Subheadline (elaborates on the headline, 1 sentence)
3. 3 key benefits (emoji + benefit + brief explanation each)
4. Social proof placeholder (e.g. "Join 500+ developers building with AI")
5. CTA button text (e.g. "Get Started Free" or "Upgrade Now")
6. Short FAQ (3 common objections + answers)
7. Urgency/scarcity element if applicable

Keep it concise, confident, and conversion-focused. Output ready to use on a landing page or Ko-fi page.`

    default:
      return `Help with: ${input}`
  }
}
